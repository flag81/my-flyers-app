import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';

type Props = {
  show: boolean;
  setShowRegisterModal: (val: boolean) => void;
  setUserId: (id: number) => void;
  setIsLoggedIn: (val: boolean) => void;
  setEmail: (email: string) => void;
};

const RegistrationModal: React.FC<Props> = ({
  show,
  setShowRegisterModal,
  setUserId,
  setIsLoggedIn,
  setEmail
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const sendVerificationCode = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(userEmail)) {
      alert('Ju lutem shkruani nje email te sakte.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      if (data.success) {
        setIsVerifying(true);
      } else {
        alert('Failed to send verification code.');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, code: verificationCode })
      });

      const data = await response.json();
      if (data.success) {
        setUserId(data.userId);
        setIsLoggedIn(true);
        setEmail(userEmail);
        setShowRegisterModal(false);
      } else {
        alert('Kodi i verifikimit i pasakt.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={show}
        onDismiss={() => setShowRegisterModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <Text style={styles.title}>
            {isVerifying ? 'Verifiko Kodin' : 'Hyrja me Email'}
          </Text>

          {!isVerifying ? (
            <>
              <TextInput
                label="Email adresa juaj"
                value={userEmail}
                onChangeText={setUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={sendVerificationCode}
                loading={loading}
                style={styles.button}
              >
                Dergo Kod-in per Hyrje
              </Button>
            </>
          ) : (
            <>
              <TextInput
                label="Sheno kodin e verifikimit"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={verifyCode}
                loading={loading}
                style={styles.button}
              >
                Verifiko
              </Button>
            </>
          )}

          {loading && <ActivityIndicator animating size="small" style={styles.loader} />}
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    padding: 20
  },
  keyboardAvoiding: {
    flexDirection: 'column',
    justifyContent: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    marginBottom: 12
  },
  button: {
    marginTop: 8
  },
  loader: {
    marginTop: 12
  }
});

export default RegistrationModal;
