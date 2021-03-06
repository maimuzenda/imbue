import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import _TestingGrounds from './assets/js/screens/_TestingGrounds'

import Boot from './assets/js/screens/Boot'
import MemberHome from './assets/js/screens/MemberHome'
import Landing from './assets/js/screens/Landing'
import PartnerHome from './assets/js/screens/PartnerHome'
import SignUp from './assets/js/screens/SignUp'
import Login from './assets/js/screens/Login'
import LoginPartner from './assets/js/screens/LoginPartner'
import UserDashboard from './assets/js/screens/UserDashboard'
import ProfileSettings from './assets/js/screens/ProfileSettings'
import PaymentSettings from './assets/js/screens/PaymentSettings'
import AddPaymentMethod from './assets/js/screens/AddPaymentMethod'
import PartnerSignUpV2 from './assets/js/screens/PartnerSignUpV2'
import PartnerDashboard from './assets/js/screens/PartnerDashboard'
import PartnerGymSettings from './assets/js/screens/PartnerGymSettings'
import PartnerUpdateMemberships from './assets/js/screens/PartnerUpdateMemberships'
import ScheduleViewer from './assets/js/screens/ScheduleViewer'
import SchedulePopulate from './assets/js/screens/SchedulePopulate'
import PartnerRevenueInfo from './assets/js/screens/PartnerRevenueInfo'
import GoLive from './assets/js/screens/GoLive'
import Livestream from './assets/js/screens/Livestream'
import PurchaseUnlimited from './assets/js/screens/PurchaseUnlimited'
import GymDescription from './assets/js/screens/GymDescription'
import UserMemberships from './assets/js/screens/UserMemberships'
import ClassDescription from './assets/js/screens/ClassDescription'
import PartnerUpdateClasses from './assets/js/screens/PartnerUpdateClasses'
import PasswordReset from './assets/js/screens/PasswordReset'
import MindbodyActivation from './assets/js/screens/MindbodyActivation'
import Waitlist from './assets/js/screens/Waitlist'

const Stack = createStackNavigator()



/**
 * Always keep initialParams initialized for each screen,
 * otherwise may run into cannot read <property> of null/undefined error.
 */
export default function App() {

  
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name='Boot'
          component={Boot}
          initialParams={{}}
        />
        <Stack.Screen
          name='Landing'
          component={Landing}
          initialParams={{}}
        />
        <Stack.Screen
          name='MemberHome'
          component={MemberHome}
          initialParams={{}}
        />
        <Stack.Screen
          name='PartnerHome'
          component={PartnerHome}
          initialParams={{}}
        />
        <Stack.Screen
          name='SignUp'
          component={SignUp}
          initialParams={{}}
        />
        <Stack.Screen
          name='Login'
          component={Login}
          initialParams={{}}
        />
        <Stack.Screen
          name='LoginPartner'
          component={LoginPartner}
          initialParams={{}}
        />
        <Stack.Screen
          name='UserDashboard'
          component={UserDashboard}
          initialParams={{}}
        />
        <Stack.Screen
          name='UserMemberships'
          component={UserMemberships}
          initialParams={{}}
        />
        <Stack.Screen
          name='ProfileSettings'
          component={ProfileSettings}
          initialParams={{}}
        />
        <Stack.Screen
          name='PaymentSettings'
          component={PaymentSettings}
          initialParams={{}}
        />
        <Stack.Screen
          name='GymDescription'
          component={GymDescription}
          initialParams={{}}
        />
        <Stack.Screen
          name='PartnerSignUp'
          component={PartnerSignUpV2}
          initialParams={{}}
        />
        <Stack.Screen
          name='PartnerDashboard'
          component={PartnerDashboard}
          initialParams={{}}
        />
        <Stack.Screen
          name='PartnerGymSettings'
          component={PartnerGymSettings}
          initialParams={{}}
        />
        <Stack.Screen
          name='PartnerUpdateMemberships'
          component={PartnerUpdateMemberships}
          initialParams={{}}
        />
        <Stack.Screen
          name='PartnerRevenueInfo'
          component={PartnerRevenueInfo}
          initialParams={{}}
        />
        <Stack.Screen
          name='PurchaseUnlimited'
          component={PurchaseUnlimited}
          initialParams={{}}
        />
        <Stack.Screen
          name='Livestream'
          component={Livestream}
          initialParams={{}}
        />
        <Stack.Screen
          name='GoLive'
          component={GoLive}
          initialParams={{}}
        />
        <Stack.Screen
          name='AddPaymentMethod'
          component={AddPaymentMethod}
          initialParams={{}}
        />
        <Stack.Screen
          name='ScheduleViewer'
          component={ScheduleViewer}
          initialParams={{}}
        />
        <Stack.Screen
          name='ClassDescription'
          component={ClassDescription}
          initialParams={{}}
        />
        <Stack.Screen
          name='PartnerUpdateClasses'
          component={PartnerUpdateClasses}
          initialParams={{}}
        />
        <Stack.Screen
          name='SchedulePopulate'
          component={SchedulePopulate}
          initialParams={{}}
        />
        <Stack.Screen
          name='Test'
          component={_TestingGrounds}
          initialParams={{}}
        />
        <Stack.Screen
          name='PasswordReset'
          component={PasswordReset}
          initialParams={{}}
        />
        <Stack.Screen
          name='MindbodyActivation'
          component={MindbodyActivation}
          initialParams={{}}
        />
        <Stack.Screen
          name='Waitlist'
          component={Waitlist}
          initialParams={{}}
        />
        {/*
        <Stack.Screen
          name=''
          component={}
          initialParams={{}}
        />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
