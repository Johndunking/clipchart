import React, { createContext, useState, useEffect } from 'react';
import firebaseAuth from '@react-native-firebase/auth'; // Renamed here

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuth().onAuthStateChanged((user) => { // Updated here
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password, saveCredentials = true) => {
    try {
      await firebaseAuth().signInWithEmailAndPassword(email, password); // Updated here
      if (saveCredentials) {
        // Optionally save credentials using AsyncStorage if needed
      }
    } catch (error) {
      console.error("Failed to log in", error);
    }
  };

  const logout = async () => {
    try {
      await firebaseAuth().signOut(); // Updated here
      setUser(null);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};