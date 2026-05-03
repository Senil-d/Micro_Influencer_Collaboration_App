import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Brand Screens
import MyCollaborationsScreen from "../screens/brand/MyCollaborationsScreen";
import CreateCollaborationScreen from "../screens/brand/CreateCollaborationScreen";
import ApplicantsScreen from "../screens/brand/ApplicantsScreen";

// Influencer Screens
import HomeScreen from "../screens/influencer/HomeScreen";
import CollaborationDetailScreen from "../screens/influencer/CollaborationDetailScreen";
import MyApplicationsScreen from "../screens/influencer/MyApplicationsScreen";
import ApplyScreen from "../screens/influencer/ApplyScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Brand Tab Navigator
const BrandTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6C63FF",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="MyCollaborations"
        component={MyCollaborationsScreen}
        options={{ tabBarLabel: "My Posts" }}
      />
      <Tab.Screen
        name="CreateCollaboration"
        component={CreateCollaborationScreen}
        options={{ tabBarLabel: "Create" }}
      />
    </Tab.Navigator>
  );
};

// Brand Stack (Tabs + Extra Screens)
const BrandStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrandTabs" component={BrandTabs} />
      <Stack.Screen name="Applicants" component={ApplicantsScreen} />
    </Stack.Navigator>
  );
};

// Influencer Tab Navigator
const InfluencerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6C63FF",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Explore" }}
      />
      <Tab.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
        options={{ tabBarLabel: "My Applications" }}
      />
    </Tab.Navigator>
  );
};

// Influencer Stack (Tabs + Extra Screens)
const InfluencerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InfluencerTabs" component={InfluencerTabs} />
      <Stack.Screen
        name="CollaborationDetail"
        component={CollaborationDetailScreen}
      />
      <Stack.Screen name="Apply" component={ApplyScreen} />
    </Stack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!user) {
    return <AuthStack />;
  }

  if (user.role === "brand") {
    return <BrandStack />;
  }

  if (user.role === "influencer") {
    return <InfluencerStack />;
  }
};

// App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
