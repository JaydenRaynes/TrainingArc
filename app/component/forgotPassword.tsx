import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { Stack, useRouter} from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const auth = getAuth();
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent!');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={ styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Send Reset Email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#191a2f',
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 20, 
    textAlign: "center" },
  input: {
    backgroundColor: '#2c2f48',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: 'white',
  },
  button: {
    backgroundColor: '#ffa500',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#191a2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 10,
  },
  
  backButtonText: {
    color: 'white',
    fontSize: 20,
  },  

});
