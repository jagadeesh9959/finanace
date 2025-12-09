import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import Home from "../home";
import Loans from "../loans";
import Help from "../help";
import Profile from "../profile";

const Tab = createBottomTabNavigator();

export default function BottomTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#001F3F",
        tabBarInactiveTintColor: "#6C757D",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color }) => {
          const icons = {
            Home: "home-outline",
            Loans: "wallet-outline",
            Help: "help-circle-outline",
            Profile: "person-outline",
          };

          return <Ionicons name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Loans" component={Loans} />
      <Tab.Screen name="Help" component={Help} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
