import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import firebaseAuth from '@react-native-firebase/auth';
import { AuthContext } from '../context/AuthContext';

const Login = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Show an alert to ask if the user wants to remember their credentials
      Alert.alert(
        "Remember Credentials?",
        "Would you like to save your login credentials?",
        [
          {
            text: "No",
            onPress: async () => {
              await firebaseAuth().signInWithEmailAndPassword(username, password);
              login(username, password, false); // Passing false for rememberMe
              navigation.navigate('Classes');
            },
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: async () => {
              await firebaseAuth().signInWithEmailAndPassword(username, password);
              // Optionally save credentials using AsyncStorage if needed
              login(username, password, true); // Passing true for rememberMe
              navigation.navigate('Classes');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid username or password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        autoCapitalize="none" 
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none" 
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
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

export default Login;