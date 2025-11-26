import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  
  // Get the days date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  const checkSessionActive = async () => {
    try {
      const storedCurrentSession = await AsyncStorage.getItem('currentSession')
      if (storedCurrentSession) {
        router.push('/Session');
      } else {
        router.replace('/SelectRoster')
      }
      return
    } catch (error) {
      console.error('Failed to load current session:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dateCard}>
        <Text style={styles.dateLabel}>
            TODAYS DATE
        </Text>
        <Text style={styles.dateValue}>
            {formattedDate}
        </Text>
      </View>

      <TouchableOpacity style={styles.sessionCard}
        onPress={checkSessionActive}
      >
        <View>
          <Text style={styles.sessionText}>
          Start Session
          </Text>
          <Text style={styles.sessionSubText}>
            Begin a new scouting report.
          </Text>
        </View>
        <Ionicons name="play" size={32} color="#fff" />
      </TouchableOpacity>

      {/* <TouchableOpacity
       onPress={() => router.replace("/login")}
      >
        <Text>
          logout
        </Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 40,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  sessionCard: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    width: '90%',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 20,
  },
  sessionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  sessionSubText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fff'
  },
});