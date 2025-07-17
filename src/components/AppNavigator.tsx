import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
// You can import an icon library like this:
// import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Hides the header for each screen
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        // options={{
        //   tabBarIcon: ({ color, size }) => (
        //     <Ionicons name="home" color={color} size={size} />
        //   ),
        // }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        // options={{
        //   tabBarIcon: ({ color, size }) => (
        //     <Ionicons name="heart" color={color} size={size} />
        //   ),
        // }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;