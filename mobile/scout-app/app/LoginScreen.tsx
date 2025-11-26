import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen({ onLogin } : { onLogin: (login: string | null) => void}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || !token) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    // Demo Version:

    if (email !== "manuel@gmail.com" || password !== "8989" || token !== "123"){
      onLogin(null)
      setLoading(false)
      Alert.alert('Error', 'Some fields invalid.')
    } else {
      onLogin('user0')
      setLoading(true)
    }
    
    // try {
    //   // Replace with your actual API endpoint
    //   const response = await fetch('https://your-api.com/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password }),
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     // Store token and navigate
    //     onLogin(data.token);
    //   } else {
    //     Alert.alert('Error', data.message || 'Login failed');
    //   }
    // } catch (error) {
    //   Alert.alert('Error', 'Network error. Please try again.');
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Token"
        value={token}
        onChangeText={setToken}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Start Scouting'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.demoText}>
          DEMO MODE
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#908c8cff', padding: 15, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#B80009', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  demoText: { color: '#908c8cff', textAlign: 'center', fontSize: 14, marginTop: 30 }
});