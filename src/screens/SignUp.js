import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import firebaseAuth from '@react-native-firebase/auth';  // Renamed here

const SignUp = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isAspireEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@aspirepublicschools\.org$/;
    return emailPattern.test(email);
  };

  const handleSignUp = async () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter both a username and a password.');
      return;
    }

    if (!isAspireEmail(username)) {
      Alert.alert('Error', 'Please use an @aspirepublicschools.org email address.');
      return;
    }

    // Create a new user account with Firebase Authentication
    try {
      await firebaseAuth().createUserWithEmailAndPassword(username, password); // Updated here
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong during sign up.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
        keyboardType="email-address"
        autoCapitalize="none"  // Prevent the first letter from being capitalized
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"  // Optional: Prevent capitalization for the password field as well
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default SignUp;