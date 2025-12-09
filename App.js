import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "./screens/auth/login";
import Otp from "./screens/auth/otp";
import BasicInfo from "./screens/auth/basicinfo";
import ProfessionalInfo from "./screens/auth/professionalinfo";
import KycVerification from "./screens/auth/kycverification";
import KycUpload from "./screens/auth/kycupload";
import ProfileAnalysis from "./screens/auth/profileanalysis";
import LoanApproved from "./screens/auth/loanapproved";
import EmiCalculator from "./screens/auth/emicalculator";
import FinalSteps from "./screens/auth/finalsteps";
import SuccessScreen from "./screens/auth/sucessscreen";
import ThankYou from "./screens/auth/thankyou";
import BottomTab from "./screens/components/bottomtab";
import Home from "./screens/home";
import Loans from "./screens/loans";
import Help from "./screens/help";
import Profile from "./screens/profile";


const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="login">
          
          <Stack.Screen
            name="login"
            component={Login}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Otp"
            component={Otp}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="BasicInfo"
            component={BasicInfo}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ProfessionalInfo"
            component={ProfessionalInfo}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="KycVerification"
            component={KycVerification}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="KycUpload"
            component={KycUpload}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ProfileAnalysis"
            component={ProfileAnalysis}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="LoanApproved"
            component={LoanApproved}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="EmiCalculator"
            component={EmiCalculator}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="FinalSteps"
            component={FinalSteps}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="SuccessScreen"
            component={SuccessScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ThankYou"
            component={ThankYou}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="bottomTabs"
            component={BottomTab}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Loans"
            component={Loans}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Help"
            component={Help}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: false }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
