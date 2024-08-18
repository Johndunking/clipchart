import React, { createContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth'; // Correct import

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setting up the listener for authentication state changes
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const login = async (email, password, saveCredentials = true) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      if (saveCredentials) {
        // Optionally save credentials using AsyncStorage if needed
      }
    } catch (error) {
      console.error("Failed to log in", error);
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
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
