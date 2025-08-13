import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomHeaderComponent from '../components/CustomHeaderComponent';
import { Ionicons } from '@expo/vector-icons';

// Define the type for the tab navigator's screen list
export type TabParamList = {
  Fillimi: undefined;
  Favoritet: { isFavorites: boolean };
  'Ne zbritje': { onSale: boolean };
  // NEW: Add Konfigurimi to the TabParamList
  Konfigurimi: undefined;
};

// Define the parameters for the drawer navigator.
export type DrawerParamList = {
  // UPDATED: Changed to reflect the actual screen names in the drawer.
  Home: undefined;
  Konfigurimi: undefined;
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
          // UPDATED: Include Konfigurimi in the route name type
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
          } else if (route.name === 'Konfigurimi') {
            // NEW: Add icon for the Settings tab
            iconName = focused ? 'settings' : 'settings-outline';
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
      {/* --- NEW: Add the Settings screen to the tab navigator --- */}
      <Tab.Screen
        name="Konfigurimi"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      // Use the `header` option in `screenOptions` to apply the custom header to all screens.
      screenOptions={{
        header: (props:any) => <CustomHeaderComponent title={props.options.title || 'Zbritje'} />,
      }}
    >
      <Drawer.Screen name="Home" component={MainTabs} options={{ title: 'Fillimi' }} />
      {/* --- UPDATED: This now navigates to the Konfigurimi tab within MainTabs --- */}
      <Drawer.Screen
        name="Konfigurimi"
        component={MainTabs} // Point to the Tab Navigator
        // Set the initial screen within the Tab Navigator to be 'Konfigurimi'
        initialParams={{ screen: 'Konfigurimi' }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return <DrawerNavigator />;
}