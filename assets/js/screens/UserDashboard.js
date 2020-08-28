import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Animated, TouchableHighlight } from 'react-native'

import { useDimensions } from '@react-native-community/hooks'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'

import { mapStyle } from "../contexts/MapStyle"
import ProfileLayout from "../layouts/ProfileLayout"

import CustomButton from "../components/CustomButton"
import GymBadge from "../components/GymBadge"

import auth from "@react-native-firebase/auth"
import { retrieveUserData, retrieveGymsByLocation, retrieveClassesByUser } from '../backend/CacheFunctions'
import Icon from '../components/Icon'
import { publicStorage } from '../backend/HelperFunctions'
import { simpleShadow } from '../contexts/Colors'

// import UserIcon from "../components/not in use/UserIcon"



export default function UserDashboard(props) {
  let cache = props.route.params.cache

  const [expanded, setExpanded] = useState(false)
  const { width, height } = useDimensions().window
  const slidingAnim = useRef(new Animated.Value(-1 * width - 25)).current

  const [user, setUser] = useState(null)
  const [gyms, setGyms] = useState(null)

  const [Markers, MarkersCreate] = useState(null)
  const [CurrentGymBadge, GymBadgeCreate] = useState(null)

  useEffect(() => {
    async function init() {
      let user = await retrieveUserData(cache)
      setUser(user)
      let promises = await Promise.all([
        retrieveGymsByLocation(cache),
        retrieveClassesByUser(cache),
      ])
      setGyms(promises[0])
    }
    init()
  }, [])

  useEffect(() => {
    if (!gyms) return

    MarkersCreate(gyms.map((gym, idx) => {
      if (gym.hidden_on_map) return

      return (
        <Marker
          coordinate={gym.coordinate}
          key={idx}
          onPress={() => {
            GymBadgeCreate(
              gyms
                .filter((gym, idx2) => idx2 === idx)
                .map(gym => {
                  return (
                    <GymBadge
                      containerStyle={styles.badgeContainer}
                      name={gym.name}
                      desc={gym.description}
                      rating={`${gym.rating} (${gym.rating_weight})`}
                      relativeDistance={""}
                      iconUri={publicStorage(gym.icon_uri)}
                      key={idx}
                      onMoreInfo={() => {
                        props.navigation.navigate(
                          "GymDescription", { gymId: gym.id })
                      }}
                      onX={() => GymBadgeCreate(null)}
                    />
                  )
                })
            )
          }}
        />
      )
    }
    ))
  }, [gyms])

  function sidePanelToggle() {
    if (expanded) {
      sidePanelSlideIn()
      setExpanded(false)
    }
    else {
      sidePanelSlideOut()
      setExpanded(true)
    }
  }

  function sidePanelSlideIn() {
    Animated.timing(slidingAnim, {
      toValue: -1 * width - 25, // -35 to hide the added side in <ProfileLayout /> as well
      duration: 275,
      useNativeDriver: false,
    }).start()
  }

  function sidePanelSlideOut() {
    Animated.timing(slidingAnim, {
      toValue: 0,
      duration: 425,
      useNativeDriver: false,
    }).start()
  }

  return (
    <>
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      customMapStyle={mapStyle}
      region= {{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {Markers}
    </MapView>

    {CurrentGymBadge}
    {/* {Menu} */}

    {
    !user ? null :
    expanded ? null :
      <View style={{
        marginTop: 10,
        marginLeft: 10,
        position: "absolute",
        zIndex: 0,
      }}>
        <TouchableHighlight
          style={{
            borderRadius: 999,
          }}
          underlayColor="#000000C0"
          onPress={sidePanelToggle}
          // [uncomment upon DEBUG start]
          onLongPress={sidePanelToggle}
          // onLongPress={() => console.log("./.../iuyhb")}
          // [comment upon DEBUG end]
        >
          {/* <UserIcon
            containerStyle={{
              width: 64,
              height: 64,
              borderRadius: 999,
              overflow: "hidden",
              ...simpleShadow,
            }}
            source={{ uri: publicStorage(user.icon_uri) }}
          /> */}
          <Icon
            containerStyle={{
              width: 64,
              height: 64,
              borderRadius: 999,
              overflow: "hidden",
              ...simpleShadow,
            }}
            source={{ uri: publicStorage(user.icon_uri) }}
          />
        </TouchableHighlight>
      </View>
    }

    {!user ? null :
    <Animated.View style={[styles.sidePanel, { left: slidingAnim }]}>
      <ProfileLayout
        innerContainerStyle={{
          paddingBottom: 10,
        }}
        data={{ name: user.name, iconUri: user.icon_uri }}
        buttonOptions={{
          logOut: {
            show: true,
            onLongPress: () => {
              auth().signOut()
              props.navigation.navigate("Boot", { referrer: "UserDashboard" })
              if (expanded) sidePanelToggle()
            }
          },
        }}
        onBack={sidePanelToggle}
      >
        <CustomButton
          icon={
            <Icon
              source={require("../components/img/png/my-classes.png")}
            />
          }
          title="My Classes"
          onPress={() => {
            props.navigation.navigate(
              "ScheduleViewer"
              // { classIds: user.active_classes }
            )
          }}
        />
        <CustomButton
          icon={
            <Icon
              source={require("../components/img/png/user-memberships.png")}
            />
          }
          title="Manage Memberships"
          onPress={() => props.navigation.navigate(
            "UserMemberships")}
        />
        <CustomButton
          icon={
            <Icon
              source={require("../components/img/png/profile.png")}
            />
          }
          title="Edit Profile"
          onPress={() => props.navigation.navigate(
            "ProfileSettings")}
        />
        <CustomButton
          icon={
            <Icon
              source={require("../components/img/png/generic-credit-card.png")}
            />
          }
          title="Payment Settings"
          onPress={() => props.navigation.navigate(
            "PaymentSettings")}
        />

      </ProfileLayout>
    </Animated.View>}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    // minHeight: "100%", // This breaks sidePanel within <Anmimated.View>; minHeight does not synergize well with child position: "absolute" 's ? ; Unless it's used for ScrollView containerStyle?
    // flex: 1,
    // width: "100%",
    // height: "100%",
  },
  sidePanel: {
    width: "100%",
    height: "100%",
    // minWidth: "100%",
    // minHeight: "100%",
    position: "absolute",
    zIndex: 100,
  },
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: "#addbff", // water fill before map loads
    zIndex: -1000,
  },
  badgeContainer: {
    width: "100%",
    marginBottom: 40,
    bottom: 0,
  },
})