import DataObject from './DataObject'
import ClassesCollection from './ClassesCollection'
import GymsCollection from './GymsCollection'
import cache from './cache'

import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import functions from '@react-native-firebase/functions'
import storage from '@react-native-firebase/storage'
import {
  publicStorage,
} from '../BackendFunctions'
import {
  ClassAlreadyBoughtError,
  ClassAlreadyScheduledError,
  MembershipAlreadyBoughtError,
} from '../Errors'
import { requestPermissions } from '../HelperFunctions'
import ImagePicker from 'react-native-image-picker'



/**
 * All methods beginning with 'retrieve' are good to be used right after
 * instantiation. Any further methods created with retrieve must also start
 * with [ await this.init() ].
 * 
 * To use any other methods, such as .mergeItems(), instance has to be init'ed
 * by [ await this.init() ].
 */
export default class User extends DataObject {
  constructor() {
    const firebaseUser = auth().currentUser
    let collection = 'users'
    let accountType = 'user'

    // When instantiating the user could be signed in, could also not be
    if (firebaseUser) {
      const { displayName } = firebaseUser
      let idx = displayName.search('_')
      accountType = displayName.slice(0, idx)
  
      if (accountType == 'partner') collection = 'partners'
    }

    super(collection)
    this.firebaseUser = firebaseUser
    this.accountType = accountType
  }

  /**
   * Just makes sure that data is present:
   * either gets it from cache or server, then caching it.
   */
  async init() {
    await this.initByUid(this.firebaseUser.uid)
  }
  
  /**
   * For creating a brand new account
   */
  async create(form, options) {
    let {
      first,
      last,
      email,
      password,
      type,
    } = form

    let account_type, uid, icon_uri_foreign

    if (!options) {
      // Manual sign up
      account_type = type
      const user = await auth().createUserWithEmailAndPassword(email, password)
      uid = user.user.uid
      icon_uri_foreign = null
    } else {
      // Sign up through socials
      const {
        accountType,
        user,
      } = options

      account_type = accountType
      uid = user.uid

      let names = user.displayName.split(' ')
      first = names[ 0 ]
      last = names.slice(1).join(' ')
      email = user.email
      icon_uri_foreign = user.photoURL
    }

    // Determine collection
    let collection
    if (account_type == 'partner') collection = 'partners'
    else collection = 'users'

    // This is how we will know what type of account it is upon sign in
    let authPromise = auth().currentUser.updateProfile({
      displayName: `${account_type}_${first}_${last}`,
    })

    // Update instance of this object
    this.uid = uid
    this.collection = collection
    this.accountType = account_type

    // Compile the document to push
    this.mergeItems({
      account_type,
      id: uid,
      first,
      last,
      email,
      icon_uri: 'default-icon.png',
      icon_uri_foreign,
    })

    // Add additional user-type-specific fields
    if (account_type == 'partner') {
      this.mergeItems({
        associated_classes: [],
        associated_gyms: [],
        revenue: 0,
        revenue_total: 0,
      })
    } else {
      this.mergeItems({
        active_memberships: [],
        active_classes: [],
        scheduled_classes: [],
      })
    }
    
    // Send out requests
    await Promise.all([
      authPromise,
      this.push(),
    ])
  }

  async retrieveUser() {
    await this.init()
    const uid = this.uid

    const {
      first,
      last,
      icon_uri='default-icon.png',
      icon_uri_foreign,
      // For user:  These three should always be present as Arrays
      active_classes=[],
      active_memberships=[],
      scheduled_classes=[],
      // For partner:  These two should always be present as Arrays
      associated_classes=[],
      associated_gyms=[],
    } = this.getAll()

    // These should always be present, therefore merging with the main doc is fine here,
    // otherwise foreign objects should not be merged (such as name, icon_uri_full).
    if (this.accountType == 'partner') {
      this.mergeItems({
        associated_classes,
        associated_gyms,
      })
    } else {
      this.mergeItems({
        active_classes,
        active_memberships,
        scheduled_classes,
      })
    }

    return {
      ...this.getAll(),
      name: `${first} ${last}`,
      icon_uri_full:
        await publicStorage(uid)
        || icon_uri_foreign
        || await publicStorage(icon_uri),
    }
  }

  async retrievePaymentMethods() {
    await this.init()
    const cacheObj = cache(`${this.collection}/${this.uid}/payment_methods`)

    // If already cached => return that
    const data = cacheObj.get() || []
    if (data.length) return data

    // Retrieve from database
    const paymentMethods = (await this._getPaymentMethodsDbRef().get())
      .docs.map(doc => doc.data())
    
    // Cache it
    cacheObj.set(paymentMethods)

    return paymentMethods
  }

  async retrievePastTransactions() {
    await this.init()
    const cacheObj = cache(`${this.collection}/${this.uid}/payments`)

    // If already cached => return that
    const data = cacheObj.get() || []
    if (data.length) return data

    // Retrieve from database
    const payments = (await this._getPaymentsDbRef().get())
      .docs.map(doc => doc.data())

    // Cache it
    cacheObj.set(payments)

    return payments
  }

  async retrieveClasses() {
    await this.init()
    const collection = new ClassesCollection()
    const {
      // user
      active_classes=[],
      scheduled_classes=[],
      // partner
      associated_classes=[],
    } = this.getAll()

    let relevantClasses
    if (this.accountType == 'partner') {
      relevantClasses = associated_classes
    } else {
      // Combine and remove duplicates
      relevantClasses = [...new Set([...active_classes, ...scheduled_classes])]
    }

    const classes = await collection.retrieveWhere('id', 'in', relevantClasses)
    return classes
  }

  async retrieveScheduledClasses() {
    await this.init()
    const collection = new ClassesCollection()
    const { scheduled_classes=[] } = this.getAll()

    const classes = await collection.retrieveWhere('id', 'in', scheduled_classes)
    return classes
  }

  /**
   * Retrieves all associated_gyms of partner in the form of Gym objects list.
   */
  async retrievePartnerGyms() {
    await this.init()
    const collection = new GymsCollection()
    const {
      associated_gyms=[],
    } = this.getAll()

    if (this.accountType != 'partner') return

    const gyms = await collection.retrieveWhere('id', 'in', associated_gyms)
    return gyms
  }

  async addPaymentMethod(form) {
    let {
      cardNumber,
      expMonth,
      expYear,
      cvc,
      cardHolderName,
      zip,
    } = form

    // Add the payment method through Google Cloud Function
    const addPaymentMethod = functions().httpsCallable('addPaymentMethod')
    const paymentMethod = (
      await addPaymentMethod(form)
    ).data

    // Update cache
    const cacheObj = cache(`${this.collection}/${this.uid}/payment_methods`)
    const data = cacheObj.get() || []
    cacheObj.set([...data, paymentMethod])
  }

  /**
   * Does:
   *      [Read]   users > (uid)
   *      [Call]   chargeCustomer
   *      [Call]   documentClassPurchase
   *      [Write]  users > (uid) > { active_classes, scheduled_classes }
   * 
   * 1.   Checks whether the user already has purchased the class
   * 2.   Charges the user
   * 3.   Updates cache with the new purchase
   * 4.   Automatically adds the new class to user's schedule
   */
  async purchaseClass(details) {
    return await this._BusyErrorWrapper('purchaseClass', async () => {
      let {
        classId,
        timeId,
        creditCardId,
        price,
        description,
        partnerId,
        gymId,
        purchaseType,
      } = details

      await this.init()

      // Make sure data is up-to-date
      await this._forcePull()

      const {
        active_classes=[],
        scheduled_classes=[],
        icon_uri='default-icon.png',
        first,
        last,
      } = this.getAll()

      // Do not continue if class is already bought
      if (
        active_classes
          .map(it => it.time_id)
          .includes(timeId)
      ) throw ClassAlreadyBoughtError

      // Charge customer
      const chargeCustomer = functions().httpsCallable('chargeCustomer')
      await chargeCustomer({
        cardId: creditCardId,
        amount: price,
        description,
      })

      // Document payment
      const document = functions().httpsCallable('documentClassPurchase')
      document({
        classId,
        timeId,
        partnerId,
        amount: price,
        user: {
          icon_uri,
          first,
          last,
        },
      })

      // Register classes for user
      let newEntry = {
        class_id: classId,
        time_id: timeId,
      }
      this.mergeItems({
        active_classes: [active_classes, newEntry],
        scheduled_classes: [scheduled_classes, newEntry],
      })
      await this.push()
    })
  }

  /**
   * Does:
   *      [Read]   users > (uid)
   *      [Write]  users > (uid) > { scheduled_classes }
   */
  async scheduleClass(details) {
    let {
      classId,
      timeId
    } = details

    await this.init()

    // Make sure data is up-to-date
    await this._forcePull()

    const {
      scheduled_classes=[],
      icon_uri='default-icon.png',
      first,
      last,
    } = this.getAll()

    // Do not continue if class has already been scheduled
    if (
      scheduled_classes
        .map(it => it.time_id)
        .includes(timeId)
    ) throw ClassAlreadyScheduledError

    // For partner's sake, and a feature that let's them see
    // who has scheduled their class
    const document = functions().httpsCallable('documentScheduledClass')
    document({
      classId,
      timeId,
      user: {
        icon_uri,
        first,
        last,
      },
    })

    // Add to schedule
    let newEntry = {
      class_id: classId,
      time_id: timeId,
    }
    this.mergeItems({
      scheduled_classes: [...scheduled_classes, newEntry],
    })
    await this.push()
  }

  /**
   * Does:
   *      [Read]   users > (uid)
   *      [Call]   subscribeCustomer
   *      [Call]   documentMembershipPurchase
   *      [Write]  users > (uid) > { active_memberships }
   * 
   * 1.   If the request is valid (the user doesn't already own this membership),
   *      documents it in the database
   * 2.   Charges the user
   * 3.   Updates cache with the new purchase
   */
  async purchaseMembership(details) {
    return await this._BusyErrorWrapper('purchaseMembership', async () => {
      let {
        membershipId,
        creditCardId,
        price,
        description,
        partnerId,
        gymId,
      } = details

      await this.init()

      // Make sure data is up-to-date
      await this._forcePull()

      const {
        active_memberships=[],
      } = this.getAll()

      // Do not continue if membership is already owned
      if (active_memberships.includes(membershipId))
        throw MembershipAlreadyBoughtError
      
      // Charge customer, creating a subscription
      const subscribeCustomer = functions().httpsCallable('subscribeCustomer')
      await subscribeCustomer({
        gymId,
        cardId: creditCardId,
        amount: price,
        description,
      })

      // Document payment
      const document = functions().httpsCallable('documentMembershipPurchase')
      document({
        partnerId,
        gymId,
        amount: price,
      })

      // Register membership
      this.mergeItems({
        active_memberships: [active_memberships, membershipId],
      })
      await this.push()
    })
  }
  
  /**
   * Does:
   *      [Read]   users > (uid)
   *      [Call]   deleteSubscription
   *      [Write]  users > (uid) > { active_memberships }
   * 
   * 1.   Removes subscription
   * 2.   If successfully removed the subscription, removes it from the database
   * 2.   Updates cache with the new purchase
   */
  async deleteSubscription(details) {
    return await this._BusyErrorWrapper('deleteSubscription', async () => {
      let { gymId } = details

      await this.init()

      // Make sure data is up-to-date
      await this._forcePull()

      const {
        active_memberships=[],
      } = this.getAll()

      // Delete subscription
      const deleteSubscription = functions().httpsCallable('deleteSubscription')
      await deleteSubscription({
        gymIds: [ gymId ],
      })

      // Remove it from user
      let filteredMemberships = active_memberships.filter(it => it != gymId)
      this.mergeItems({
        active_memberships: filteredMemberships,
      })
      await this.push()
    })
  }

  /**
   * Creates livestream for user, assigns it to them,
   * if it hasn't already been created & assigned.
   */
  async createLivestream() {
    return await this._BusyErrorWrapper('createLivestream', async () => {
      await this.init()
      const { stream_key } = this.getAll()

      if (stream_key) return stream_key

      // Call Google Cloud Function, which creates LS & assigns it to user
      const createLivestream = functions().httpsCallable('createLivestream')
      await createLivestream()

      // Attempt many times to get it from the field, because it may not be
      // there instantly, or in the worst case – at all
      for (let i = 0; i < 15; i++) {
        await this._forcePull()
        let { stream_key: streamKey } = this.getAll()

        if (streamKey) return streamKey
        await new Promise(r => setTimeout(r, 3500)) // sleep
      }
    })
  }

  changeIcon() {
    return new Promise(async (resolve, reject) => {
      await this.init()

      // Ascertain that all permissions have been granted
      const unfulfilledPerms = requestPermissions([
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
      ])
      if (unfulfilledPerms) reject(
        'Missing permissions: '
        + unfulfilledPerms.join(', ')
      )

      // Do the image stuff
      ImagePicker.showImagePicker({}, async res => {
        if (res.didCancel) {
          // ...
        }

        if (res.error) {
          reject('Something prevented the action.')
        }

        // Main portion

        const {
          filePath,
          fileSize,
        } = res

        const {
          id: userId,
        } = this.getAll()

        // 8MB of file size limit
        if (fileSize > 8 * 1024 * 1024) {
          reject('Image file size must not exceed 8MB.')
        }

        try {
          const fileRef = storage().ref(userId)
          await fileRef.putFile(filePath)

          this.mergeItems({
            icon_uri: userId,
          })

          await this.push()
          resolve('Success.')

        } catch(err) {
          reject('Something prevented upload.')
        }
      })
    })
  }

  _getPaymentMethodsDbRef() {
    return firestore()
      .collection('stripe_customers')
      .doc(this.uid)
      .collection('payment_methods')
  }

  _getPaymentsDbRef() {
    return firestore()
      .collection('stripe_customers')
      .doc(this.uid)
      .collection('payments')
  }
}



// function appropriate() {
//   switch (user.account_type) {
//       case "user":
//           let activeClassIds = user.active_classes.map(active => active.class_id)
//           return cache.classes
//               .filter(doc => activeClassIds.includes(doc.id))
//       case "partner":
//           return cache.classes
//               .filter(doc => doc.partner_id === user.id)
//   }
// }