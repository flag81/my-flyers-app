import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SegmentedButtons, TextInput, Button } from 'react-native-paper';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth'; // Make sure useAuth is imported

const SettingsScreen = () => {
  const { userId } = useAuth(); // Get the userId from your auth context
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false); // State for the test button

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Use the new, more comprehensive endpoint
        const response = await apiService.get('/user/profile');
        const { firstName, lastName, email, notificationFrequency } = response.data;
        setFirstName(firstName || '');
        setLastName(lastName || '');
        setEmail(email || '');
        setFrequency(notificationFrequency || 'off');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        Alert.alert('Gabim', 'Cilësimet tuaja nuk mund të ngarkoheshin.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const profileData = {
        firstName,
        lastName,
        email,
        notificationFrequency: frequency,
      };
      await apiService.put('/user/profile', profileData);
      Alert.alert('Sukses', 'Ndryshimet u ruajtën.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Gabim', 'Ndryshimet nuk u ruajtën. Ju lutem provoni përsëri.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (!userId) {
      Alert.alert('Gabim', 'Nuk u gjet User ID. Ju lutem rinisni aplikacionin.');
      return;
    }
    try {
      setTesting(true);
      // Call the new endpoint to trigger the scheduler logic for the current user
      const response = await apiService.post('/trigger-user-notifications', { userId });
      Alert.alert('Sukses', response.data.message || 'Kërkesa për njoftim u dërgua.');
    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      const errorMessage = error.response?.data?.message || 'Njoftimi testues nuk u dërgua. Kontrolloni konzolën për detaje.';
      Alert.alert('Gabim', errorMessage);
    } finally {
      setTesting(false);
    }
  };

  

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Të Dhënat Personale</Text>
      
      <TextInput
        label="Emri"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Mbiemri"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.header}>Njoftimet</Text>
      <Text style={styles.description}>
        Zgjidhni sa shpesh dëshironi të merrni njoftime për produktet e reja.
      </Text>
      <SegmentedButtons
        value={frequency}
        onValueChange={setFrequency} // Only update state, don't call API
        buttons={[
          { value: 'daily', label: 'Ditore' },
          { value: 'weekly', label: 'Javore' },
          { value: 'monthly', label: 'Mujore' },
          { value: 'off', label: 'Asnjëherë' },
        ]}
        style={styles.buttons}
      />

      <Button
        mode="contained"
        onPress={handleSaveChanges}
        loading={saving}
        disabled={saving || testing}
        style={styles.saveButton}
      >
        Ruaj Ndryshimet
      </Button>

    {/* --- UPDATED: Button to trigger the notification scheduler logic --- */}
      <Button
        mode="outlined"
        icon="bell-check-outline"
        onPress={handleTestNotification}
        loading={testing}
        disabled={saving || testing}
        style={{ marginTop: 20 }}
      >
        Testo Njoftimet e Ofertave
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  buttons: {
    marginTop: 10,
  },
  saveButton: {
    marginTop: 30,
    paddingVertical: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsScreen;