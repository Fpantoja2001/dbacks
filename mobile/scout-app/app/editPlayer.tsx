import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './types/Player';

const POSITIONS = ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Shortstop', 'Third Base', 'Outfield', 'Leftfield', 'Rightfield', 'Centerfield', 'DesignatedHitter'];

export default function EditPlayerScreen() {
  const router = useRouter();
  const { playerId } = useLocalSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [throws, setThrows] = useState('');
  const [bats, setBats] = useState('');
  const [showPositionPicker, setShowPositionPicker] = useState(false);

  useEffect(() => {
    loadPlayer();
  }, [playerId]);

  const loadPlayer = async () => {
    try {
      const storedPlayers = await AsyncStorage.getItem('players');
      if (storedPlayers) {
        const players: Player[] = JSON.parse(storedPlayers);
        const player = players.find((p) => p.id === playerId);
        if (player) {
          setFirstName(player.firstName);
          setLastName(player.lastName);
          setPosition(player.position);
          setDob(player.dob);
          setHeight(player.height);
          setWeight(player.weight);
          setThrows(player.throws);
          setBats(player.bats);
        }
      }
    } catch (error) {
      console.error('Failed to load player:', error);
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !position || !height || !weight || !throws || !bats) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const storedPlayers = await AsyncStorage.getItem('players');
      const players: Player[] = storedPlayers ? JSON.parse(storedPlayers) : [];

      const updatedPlayers = players.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            firstName,
            lastName,
            position,
            height,
            weight,
            throws,
            bats,
            // DOB stays the same - not editable
          };
        }
        return p;
      });

      await AsyncStorage.setItem('players', JSON.stringify(updatedPlayers));
      router.back();
    } catch (error) {
      console.error('Failed to save player:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const getClassYear = (dobString: string) => {
    if (!dobString) return '';
    const parts = dobString.split('/');
    if (parts.length !== 3) return '';
    
    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    const birthDate = new Date(year, month - 1, day);
    const cutoffDate = new Date(year, 7, 31);

    if (birthDate <= cutoffDate) {
      return (year + 17).toString();
    } else {
      return (year + 18).toString();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Player</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Name Row */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Position */}
        <View style={styles.field}>
          <Text style={styles.label}>Position</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowPositionPicker(!showPositionPicker)}
          >
            <Text style={position ? styles.dropdownText : styles.dropdownPlaceholder}>
              {position || 'Select Position'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
          {showPositionPicker && (
            <View style={styles.pickerContainer}>
              {POSITIONS.map((pos) => (
                <TouchableOpacity
                  key={pos}
                  style={[styles.pickerItem, position === pos && styles.pickerItemSelected]}
                  onPress={() => {
                    setPosition(pos);
                    setShowPositionPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, position === pos && styles.pickerItemTextSelected]}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* DOB - Display Only */}
        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.readOnlyField}>
            <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
            <Text style={styles.readOnlyText}>{dob}</Text>
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={12} color="#6B7280" />
              <Text style={styles.lockedText}>Locked</Text>
            </View>
          </View>
          <Text style={styles.classYearHint}>Class of {getClassYear(dob)}</Text>
        </View>

        {/* Height & Weight */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Height</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder={`5'10"`}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="180"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Throws */}
        <View style={styles.field}>
          <Text style={styles.label}>Throws</Text>
          <View style={styles.toggleGroup}>
            {['R', 'L', 'S'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.toggleButton, throws === option && styles.toggleButtonActive]}
                onPress={() => setThrows(option)}
              >
                <Text style={[styles.toggleText, throws === option && styles.toggleTextActive]}>
                  {option === 'R' ? 'Right' : option === 'L' ? 'Left' : 'Switch'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bats */}
        <View style={styles.field}>
          <Text style={styles.label}>Bats</Text>
          <View style={styles.toggleGroup}>
            {['R', 'L', 'S'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.toggleButton, bats === option && styles.toggleButtonActive]}
                onPress={() => setBats(option)}
              >
                <Text style={[styles.toggleText, bats === option && styles.toggleTextActive]}>
                  {option === 'R' ? 'Right' : option === 'L' ? 'Left' : 'Switch'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#D00000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#FEE2E2',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#374151',
  },
  pickerItemTextSelected: {
    color: '#D00000',
    fontWeight: '600',
  },
  readOnlyField: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lockedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  classYearHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  toggleButtonActive: {
    backgroundColor: '#D00000',
    borderColor: '#D00000',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
});