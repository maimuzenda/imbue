import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { FONTS } from '../contexts/Styles'
import { colors } from '../contexts/Colors'
import { NetworkInfo } from 'react-native-network-info'
import config from '../../../App.config'
import functions from '@react-native-firebase/functions'
import { useNavigation } from '@react-navigation/native'
import User from '../backend/storage/User'
import Gym from '../backend/storage/Gym'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AppBackground from '../components/AppBackground'
import CompanyLogo from '../components/CompanyLogo'
import GoBackButton from '../components/buttons/GoBackButton'
import CustomTextInputV2 from '../components/CustomTextInputV2'
import CustomButton from '../components/CustomButton'
import FormStatusMessage from '../components/FormStatusMessage'



export default function PartnerSignUpV2(props) {
  const navigation = useNavigation()
  const { register, handleSubmit, setValue, errors, watch } = useForm()
  const [local, _resetLocal] = useState({})
  local.passwordText = watch('password', '')
  const [ip, setIp] = useState(ip)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const rules = {
      required: 'Required fields must be filled.',
    }

    // General
    register('password', {
      ...rules,
      pattern: {
        value: /(?=.*[a-z])(?=.*[A-Z]).{8}/,
        message:
          'Password must consist of at least 8 characters, '
          + 'and at least 1 lowercase and uppercase letter.',
      },
    })
    register('confirm_password', {
      ...rules,
      validate: text =>
        text == local.passwordText
        || 'Passwords must match.',
    })

    // Company details
    register('gym_description', rules)
    
    // Personal details
    register('first', {
      ...rules,
      pattern: {
        value: /[A-Za-z]{2,100}/,
        message: 'Name should consist of only letters, and at least two.'
      },
    })
    register('last', {
      ...rules,
      pattern: {
        value: /[A-Za-z]{2,100}/,
        message: 'Name should consist of only letters, and at least two.'
      },
    })
    register('email', rules)
  }, [register])

  useEffect(() => {
    // Stripe TOS agreement requirement
    NetworkInfo.getIPV4Address().then(setIp)
  }, [])

  // DEBUG stuff
  useEffect(() => {
    if (!config.DEBUG) return

    // setValue('company_address', '1111 S Figueroa St, Los Angeles, CA 90015')
    // setValue('company_name', 'CompanyName')
    // setValue('tax_id', '000000000')
    // setValue('phone', '888 867 5309')
    // setValue('dob', '7-6-1998')
    // setValue('address', '1111 S Figueroa St, Los Angeles, CA 90015')
    // setValue('ssn_last_4', '0000')

    setValue('first', 'First')
    setValue('last', 'Last')
    setValue('email', '')
    setValue('gym_description', 'This is the product description.')

    setValue('password', '')
    setValue('confirm_password', '')
  }, [])





  const onSubmit = async form => {
    // At this point the form has been validated, as far as individual fields go.
    // Certain data still needs to be gotten, based on form data...

    setSubmitError('')

    // Separate between core user data and other type of data,
    // and data that is to be adjusted/formatted in a sec
    let {
      password,
      confirm_password,
      gym_description,
      ...USER
    } = form

    // Create user
    const partner = new User()
    let errMsg = await partner.create({
      ...USER,
      password,
      type: 'partner',
    })

    if (errMsg) {
      setSubmitError(errMsg)
      return
    }

    try {
      // Attempt to create a Stripe account
      const createStripeSeller = functions().httpsCallable('createStripeSeller')
      await createStripeSeller({
        ...USER,
        product_description: gym_description,
        ip, // for TOS agreement
      })
    } catch(err) {
      if (config.DEBUG) console.warn(err)
      await partner.delete()
      return
    }

    // Create gym
    const gym = new Gym
    await gym.create({
      name: form.company_name,
      description: gym_description,
      partner_id: partner.uid,
    })

    if (config.DEBUG) console.log('The new gym:', gym.uid)

    partner.mergeItems({
      associated_gyms: [gym.uid],
    })
    await partner.push()

    // Redirect
    navigation.reset({
      index: 0,
      routes: [{ name: 'Boot' }],
    })
  }



  return (
    <KeyboardAwareScrollView>
      <AppBackground />
      <CompanyLogo />
      <GoBackButton containerStyle={styles.GoBackButton} />

      <Text style={styles.sectionTitle}>Partner Sign Up</Text>

      <FormStatusMessage type='error' containerStyle={{
        alignSelf: 'center',
        marginBottom: 10,
      }}>
        {
          errors
            ? (errors[Object.keys(errors)[ 0 ]] || {}).message
            : submitError
                ? submitError
                : null
        }
      </FormStatusMessage>

      <View>
        {/* Personal details */}
        <CustomTextInputV2
          containerStyle={styles.inputField}
          red={Boolean(errors.first)}
          placeholder='First Name'
          onChangeText={text => setValue('first', text)}
        />
        <CustomTextInputV2
          containerStyle={styles.inputField}
          red={Boolean(errors.last)}
          placeholder='Last Name'
          onChangeText={text => setValue('last', text)}
        />
        <CustomTextInputV2
          containerStyle={styles.inputField}
          red={Boolean(errors.email)}
          placeholder='Email'
          onChangeText={text => setValue('email', text)}
        />
        {/* <CustomTextInputV2
          containerStyle={styles.inputField}
          placeholder='Date of Birth (MM-DD-YYYY)'
          onChangeText={text => setValue('dob', text)}
        /> */}

        {/* Company details */}
        <CustomTextInputV2
          containerStyle={styles.inputField}
          red={Boolean(errors.gym_description)}
          placeholder='Gym Description'
          onChangeText={text => setValue('gym_description', text)}
        />

        {/* Password */}
        <CustomTextInputV2
          containerStyle={styles.inputField}
          red={Boolean(errors.password)}
          placeholder='Password'
          secureTextEntry
          onChangeText={text => setValue('password', text)}
        />
        <CustomTextInputV2
          containerStyle={styles.inputField}
          red={Boolean(errors.confirm_password)}
          placeholder='Confirm Password'
          secureTextEntry
          onChangeText={text => setValue('confirm_password', text)}
        />

        {/* ================ */}
        <CustomButton
          style={styles.signUpButton}
          title='Sign Up'
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 20,
    ...FONTS.title,
    alignSelf: 'center',
    fontSize: 25,
    color: colors.accent,
  },
  inputField: {
    marginBottom: 20,
    marginRight: 30,
    marginLeft: 30
  },
  signUpButton: {
    marginBottom: 20,
    marginRight: 30,
    marginLeft: 30
  },
  GoBackButton: {
    ...config.styles.GoBackButton_screenDefault,
  },
}) 