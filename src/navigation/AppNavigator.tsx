import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CustomHeaderComponent from '../components/CustomHeaderComponent';
import { Ionicons } from '@expo/vector-icons'; // Import from @expo/vector-icons





// Define the parameters that each screen in the tab navigator can receive.
// 'undefined' means the route takes no parameters.
export type TabParamList = {
  Fillimi: undefined;
  Favoritet: { isFavorites: boolean };
  'Ne zbritje': { onSale: boolean };
};

// Define the parameters for the drawer navigator.
export type DrawerParamList = {
  Main: undefined;
  Favorites: undefined;
};


// Strongly type the navigator creator functions with the param lists.
const Drawer = createDrawerNavigator<DrawerParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
        screenOptions={({
          route,
        }: {
          route: { name: keyof TabParamList };
        }) => ({
        // This function determines which icon to show for each tab
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
         // let iconName;
              let iconName: React.ComponentProps<typeof Ionicons>['name'];


          if (route.name === 'Fillimi') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favoritet') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Ne zbritje') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          }
          else {
            // Add a fallback icon to handle any other cases and satisfy TypeScript.
            iconName = 'alert-circle-outline';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Define colors for active and inactive tabs
        tabBarActiveTintColor: '#1e90ff',
        tabBarInactiveTintColor: 'gray',
        // Hide the header for all tab screens
        headerShown: false,
      })}>


      <Tab.Screen
        name="Fillimi"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Favoritet"
        component={HomeScreen}
        initialParams={{ isFavorites: true }}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Ne zbritje"
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