import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { fonts } from '../contexts/Styles'
import { TouchableHighlight } from 'react-native-gesture-handler'
import Icon from './Icon'
import { publicStorage } from '../backend/HelperFunctions'
import LiveSoonIcon from './badges/LiveSoonIcon'



/**
 * props
 *  .data -- class data
 *  .dateString -- [optional] show a specific date
 */
export default function ClassList(props) {
    let calendarData = props.data

    const [Items, ItemsCreate] = useState(null)
    const [classes, setClasses] = useState(null)

    useEffect(() => {
        if (!(calendarData instanceof Array)) return

        let filteredCalendarData = []
        if (props.dateString) {
            calendarData.forEach(doc => {
                let filteredData = {...doc}
                filteredData.active_times = doc.active_times.filter(({ dateString }) => {
                    return dateString === props.dateString
                })
                filteredCalendarData.push(filteredData)
            })
        } else filteredCalendarData = calendarData
        setClasses(filteredCalendarData)
    }, [calendarData, props.dateString])

    useEffect(() => {
        if (!classes) return

        let items = []
        classes.forEach(doc => {
            doc.active_times.forEach(({ formattedDate, formattedTime, onPress, begin_time, livestreamState }) => {
                const SidePanelContainer = (props) =>
                    <View style={{
                        position: "absolute",
                        height: "100%",
                        justifyContent: "center",
                        backgroundColor: "#00000030",
                        paddingHorizontal: 12,
                    }}>{ props.children }</View>

                items.push(
                    <TouchableHighlight
                        style={{
                            ...styles.listItem,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: "lightgreen",
                        }}
                        underlayColor="#83b02a"
                        key={begin_time}
                        onPress={onPress}
                    >
                        <View>
                            {livestreamState === "live"
                            ?   <SidePanelContainer>
                                    <Icon
                                        containerStyle={{
                                            width: 72,
                                            height: 72,
                                        }}
                                        imageStyle={{
                                            width: "75%",
                                            height: "75%",
                                        }}
                                        source={require("./img/png/live.png")}
                                    />
                                </SidePanelContainer>
                            :   null}

                            {livestreamState === "soon"
                            ?   <SidePanelContainer>
                                    <LiveSoonIcon
                                        containerStyle={{
                                            width: 72,
                                            height: 72,
                                        }}
                                        value={Math.floor((begin_time - Date.now()) / 1000 / 60)} // This could & should be made update dynamically, even if user doesn't refresh page
                                    />
                                </SidePanelContainer>
                            :   null}

                            <Icon
                                containerStyle={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    zIndex: -100,
                                }}
                                source={{ uri: publicStorage("workout.jpg") }}
                            />

                            <View style={{
                                alignItems: "center",
                            }}>
                                <Text style={styles.text}>{formattedDate}</Text>
                                <Text style={styles.text}>{formattedTime}</Text>
                                <Text style={styles.text}>{doc.name}</Text>
                                <Text style={styles.text}>{doc.instructor}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                )
            })
        })
        ItemsCreate(items)
    }, [classes])

    return (
        <View style={[
            styles.container,
            props.containerStyle,
        ]}>
            { Items }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "88%",
        alignSelf: "center",
    },
    listItem: {
        marginVertical: 10,
        // backgroundColor: "#00000008",
        // backgroundColor: "#90EE9040", // lightgreen alpha 40
        // backgroundColor: "#8FBC8F", // darkseagreen
        // backgroundColor: "#9ACD32", // yellowgreen
        // borderWidth: 1,
        // borderColor: colors.gray,
        overflow: "hidden",
    },
    text: {
        color: "white",
        fontFamily: fonts.default,
    },
})