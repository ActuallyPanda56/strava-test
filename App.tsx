import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClientProvider } from "react-query";
import { queryClient } from "./src/utils/queryClient";
import LoginView from "./src/views/LoginView";
import Activities from "./src/views/(activities)/Activities";
import MonthlyActivities from "./src/views/(activities)/MontlyActivities";
import Settings from "./src/views/Settings";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginView} />
          <Stack.Screen name="Activities" component={Activities} />
          <Stack.Screen name="Stats" component={MonthlyActivities} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
