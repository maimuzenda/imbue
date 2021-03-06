import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useNavigation } from '@react-navigation/native'
import { FONTS } from '../contexts/Styles'

import CustomCapsule from "../components/CustomCapsule"
import { simpleShadow } from '../contexts/Colors'
import BackButton from '../components/BackButton' 
import LogOutButton from '../components/buttons/LogOutButton'
import AppBackground from '../components/AppBackground'
import Icon from '../components/Icon'
import EditButton from '../components/buttons/EditButton'

import auth from "@react-native-firebase/auth"
import { GoogleSignin } from '@react-native-community/google-signin'
import { LoginManager } from 'react-native-fbsdk'
import User from '../backend/storage/User' 
import config from '../../../App.config'



export default function ProfileLayout(props) {
  const navigation = useNavigation() 

  const [errorMsg, setErrorMsg] = useState('')
  const [user, setUser] = useState()
  const [buttonOptions, setButtonOptions] = useState(null)
  const [r, refresh] = useState(0)

  useEffect(() => {
    const init = async () => {
      const user = new User() 
      setUser(await user.retrieveUser())
    }; init()
  }, [])

  useEffect(() => {
    const defaultButtonOptions = {
      goBack: {
        show: true,
      },
      logOut: {
        show: false,
       onPress: async () => {
          await Promise.all([
            auth().signOut(),
            GoogleSignin.signOut(),
            LoginManager.logOut(),
          ])
          navigation.reset({
            index: 0,
            routes: [{ name: 'Boot' }],
          })
         
        },
        // [v DEBUG ONLY v]
        onLongPress: config.DEBUG ? async () => {
          await Promise.all([
            auth().signOut(),
            GoogleSignin.signOut(),
            LoginManager.logOut(),
          ])
          navigation.reset({
            index: 0,
            routes: [{ name: 'Boot' }],
          })
        } : null,
        // [^ DEBUG ONLY ^]
      },
      editPfp: {
        show: false,
      },
    }
  
    if (props.buttonOptions) {
      Object.entries(props.buttonOptions).forEach(([button, instructions]) => {
        Object.entries(instructions).forEach(([key, value]) => {
          defaultButtonOptions[ button ][ key ] = value
        })
      })
    }
    setButtonOptions(defaultButtonOptions)
  }, [])



  const editPfp = async () => {
    setErrorMsg('')
    const user = new User()
    try {
      await user.changeIcon()
      refresh(r => r + 1)
    } catch(errorMsg) { setErrorMsg(errorMsg) }
  }



  if (!user || !buttonOptions) return <View />

  return (
    <>
    <View style={{
      width: "100%",
      height: "100%",
      position: "absolute",
      left: 25,
      backgroundColor: "#F9F9F9",
      borderRadius: 40,
    }}/>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollView}
      keyboardShouldPersistTaps='handled'
        // alwaysBounceVertical={false} 
    >
      <AppBackground />

      <View style={{
        marginVertical: 50,
      }}>
        <Icon
          containerStyle={{
            width: 200,
            height: 200,
            position: "absolute",
            alignSelf: "center",
            borderRadius: 999,
            overflow: "hidden",
            ...simpleShadow,
            zIndex: 100,
          }}
          source={{ uri: user.icon_uri_full }}
        />
        <View style={{
          width: 200,
          height: 200,
          position: "absolute",
          alignSelf: "center",
          alignItems: "center",
          ...simpleShadow,
          zIndex: 110,
        }}>
          {buttonOptions.editPfp.show
          ? <EditButton
              containerStyle={{
                top: 145,
                left: 65,
              }}
              onPress={editPfp}
              // [v DEBUG ONLY v]
              onLongPress={config.DEBUG ? editPfp : undefined}
              // [^ DEBUG ONLY ^]
            />
          : null}
        </View>

        <CustomCapsule
          style={[
            {
              marginTop: 115,
              width: "88%",
              alignSelf: "center",
            },
            props.containerStyle,
          ]}
          innerContainerStyle={[
            {
              paddingTop: 90,
            },
            props.innerContainerStyle,
          ]} 
        >
          {errorMsg && errorMsg.length
          ? <Text style={{ color: "red" }}>{ errorMsg }</Text>
          : null}

          {!buttonOptions.goBack.show || props.hideBackButton ? null :
          <TouchableHighlight
            style={styles.sidePanelButtonContainer}
            underlayColor="#eed"
            onPress={props.onBack || (() => navigation.goBack())}
          >
            <BackButton
              imageStyle={{
                width: 48,
                height: 48,
              }}
            />
          </TouchableHighlight>}

          {buttonOptions.logOut.show ?
          <LogOutButton
            containerStyle={{
              position: "absolute",
              top: 10,
              right: 10,
            }}
            onPress={buttonOptions.logOut.onPress}
            onLongPress={buttonOptions.logOut.onLongPress}
          /> : null}

          <Text
            style={styles.profileName}
            numberOfLines={1}
          >
            {user.name}
          </Text>

          {props.children}

        </CustomCapsule>

      </View>
      </KeyboardAwareScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    minHeight: "100%",
  },
  profileName: {
    // marginTop: 15,
    marginBottom: 10,
    alignSelf: "center",
    ...FONTS.title,
    fontSize: 22,
  },
  sidePanelButtonContainer: {
    ...simpleShadow,
    backgroundColor: "white",
    marginTop: 10,
    marginLeft: 10,
    position: "absolute",
    justifyContent: "center", 
    alignItems: "center",
    borderRadius: 999,
    zIndex: 110,
  },
})