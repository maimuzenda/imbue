import React from 'react'
import { StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native'

import { colors } from "../contexts/Colors"

import AppBackground from "../components/AppBackground"

import CompanyLogo from "../components/CompanyLogo"
import CustomButton from "../components/CustomButton"
import CustomCapsule from '../components/CustomCapsule'
import { FONTS } from '../contexts/Styles'



export default function Landing(props) {
    function signUp() {
        props.navigation.navigate("SignUp")
    }

    function partnerSignUp() {
        props.navigation.navigate("PartnerSignUp")
    }

    // User home
    function memberHome() {
        props.navigation.navigate("MemberHome")
    }

    function partnerHome() {
        props.navigation.navigate("PartnerHome")
    }

    return (
        <ScrollView alwaysBounceVertical={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
            <AppBackground />
            <CompanyLogo
                containerStyle={{
                    top: 0, 
                    position: "absolute",
                    alignSelf: "center",
                }}
            /> 

            <CustomCapsule
                containerStyle={{
                    width: "88%",
                    alignSelf: "center",
                    marginBottom: 50,
                }}
            >
                 <Text style={{
                        marginTop: 0,
                        marginBottom: 0,
                        color: colors.gray,
                        textAlign: "center",
                        fontSize: 18,
                        
            }}>I'm a:</Text>

                <CustomButton
                    style={{
                        marginTop: 20,
                        marginBottom: 0,
                    }}
                    onPress={memberHome}
                    title="member"
                />
                <CustomButton
                    styleIsInverted
                    style={{
                        marginTop: 20,
                        marginBottom: 0,
                    }}
                    title="influencer/trainer"
                    onPress={partnerHome}
                />
            </CustomCapsule>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        minHeight: "100%",
        flexDirection: "column-reverse",
        backgroundColor: "#F9F9F9",
        // alignItems: "center",
    },
    container: {
        width: "80%",
        marginBottom: 50,
        backgroundColor: "#F9F9F9",
    },
})