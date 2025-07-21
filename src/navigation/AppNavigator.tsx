import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CustomHeaderComponent from '../components/CustomHeaderComponent';


const Drawer = createDrawerNavigator(); 
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Favorites"
        component={HomeScreen}
        initialParams={{ isFavorites: true }}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="OnSale"
        component={HomeScreen}
        initialParams={{ onSale: true }}
        options={{ headerShown: false }}
      />
      {/* Add more tabs here */}
    </Tab.Navigator>
  );
}




export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Main" component={MainTabs} 
        
            options={{
            //headerTitle: 'Meniven',
           // headerShown: true, // Show or hide header
            header: () => <CustomHeaderComponent title="Meniven.com" />
            // You can also use header: () => <CustomHeaderComponent />
          }}
        
        />

        <Drawer.Screen name="Favorites" component={FavoritesScreen} 

                    options={{
            //headerTitle: 'Meniven',
           // headerShown: true, // Show or hide header
            header: () => <CustomHeaderComponent title="Meniven.com" />
            // You can also use header: () => <CustomHeaderComponent />
          }}
        />


        {/* Add more drawer items here */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}