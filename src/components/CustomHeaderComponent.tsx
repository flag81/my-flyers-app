import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CustomHeaderProps = {
  title: string;
};

const CustomHeaderComponent: React.FC<CustomHeaderProps> = ({ title }) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.icon}>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>

   <Image
         source={require('../assets/logo.png')}
         style={styles.logo}
       />





      </View>



    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
  },
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  icon: {
    padding: 5,
  },
    logo: {
    height: 50,
    width: 120,
    resizeMode: 'contain',
  }
});

export default CustomHeaderComponent;