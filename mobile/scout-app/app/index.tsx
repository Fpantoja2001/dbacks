import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './LoginScreen';
import { router } from 'expo-router';

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    AsyncStorage.getItem('userToken').then(token => {
      setUserToken(token);
      setIsLoading(false);
    });
  }, []);

    useEffect(() => {
    if (!isLoading && userToken) {
      router.replace('/(tabs)');
    }
  }, [userToken, isLoading]);

  const handleLogin = async (token: string | null) => {
    if (token) {
      await AsyncStorage.setItem('userToken', token);
    } else {
      await AsyncStorage.removeItem('userToken');
    }
    setUserToken(token);
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (userToken) {
    return null; // Will redirect via useEffect
  }

  return <LoginScreen onLogin={handleLogin} />;
}