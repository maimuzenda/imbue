import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { simpleShadow } from '../../contexts/Colors'
import CalendarAddIcon from '../badges/CalendarAddIcon'



export default function AddToCalendarButton(props) {
  return (
    <View style={{
      backgroundColor: "white",
      borderRadius: 999,
      zIndex: 110,
      ...simpleShadow,
      ...props.containerStyle,
    }}>
      <TouchableHighlight
        style={{
          borderRadius: 999,
        }}
        underlayColor="#00000020"
        onPress={props.onPress || undefined}
      >
        <CalendarAddIcon
          containerStyle={props.imageContainerStyle}
          imageStyle={props.imageStyle}
        />
      </TouchableHighlight>
    </View>
  )
}

const styles = StyleSheet.create({})