import React from 'react'
import { View } from 'react-native'
import { TouchableHighlight } from 'react-native-gesture-handler'
import Icon from '../Icon'
import { simpleShadow } from '../../contexts/Colors'
import { useNavigation } from '@react-navigation/native'



export default function GoBackButton(props) {
  const navigation = useNavigation()
  const {
    containerStyle={},
    imageContainerStyle={},
    imageStyle={},
    //
    onPress=() => navigation.goBack(),
  } = props


  
  return (
    <View style={{
      backgroundColor: "white",
      borderRadius: 999,
      zIndex: 110,
      ...simpleShadow,
      ...containerStyle,
    }}>
      <TouchableHighlight
        style={{
          borderRadius: 999,
        }}
        underlayColor="#00000020"
        onPress={onPress}
      >
        <Icon
          containerStyle={{
            width: 50,
            height: 50,
            ...imageContainerStyle,
          }}
          imageStyle={imageStyle}
          source={require("../img/png/back-button-4.png")}
        />
      </TouchableHighlight>
    </View>
  )
}