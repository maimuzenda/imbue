import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import { fonts } from '../contexts/Styles';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { colors } from '../contexts/Colors';



export default function CancelButton(props) {
    const title = props.title
    const [holdToExit, helpUser] = useState(false)

    return (
        <View style={{
            backgroundColor: "#00000060",
            borderWidth: 1,
            borderColor: colors.gray,
            borderRadius: 999,
        }}>
            {holdToExit
            ?   <View style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#00000060",
                    borderRadius: 999,
                }}>
                    <Text style={{
                        color: "white",
                        fontSize: 14,
                        fontFamily: fonts.default,
                    }}>Hold to Exit</Text>
                </View>
            :   null}
            <TouchableHighlight
                style={{
                    height: 50,
                    padding: 10,
                    justifyContent: "center",
                    ...props.containerStyle,
                }}
                underlayColor="#00000012"
                onPress={() => helpUser(true)}
                onLongPress={props.onLongPress}
            >
                <Text style={{
                    color: "white",
                    paddingHorizontal: 10,
                    fontSize: 16,
                    fontFamily: fonts.default,
                    ...props.textStyle,
                }}>{ holdToExit ? "  ".repeat(title.length) : title }</Text>
            </TouchableHighlight>
        </View>
    )
}