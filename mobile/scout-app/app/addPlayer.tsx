import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import  Player  from './types/Player';

export default function AddPlayerScreen() {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('Pitcher');
  const [dob, setDob] = useState('01/01/2005');
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [throws, setThrows] = useState('R');
  const [bats, setBats] = useState('R');


const positions = [
    { label: 'Pitcher', value: 'Pitcher' },
    { label: 'Catcher', value: 'Catcher' },
    { label: 'First Base', value: 'First Base' },
    { label: 'Second Base', value: 'Second Base' },
    { label: 'Shortstop', value: 'Shortstop' },
    { label: 'Third Base', value: 'Third Base' },
    { label: 'Outfield', value: 'Outfield' },
    { label: 'Leftfield', value: 'Leftfield' },
    { label: 'Rightfield', value: 'Rightfield' },
    { label: 'Centerfield', value: 'Centerfield' },
    { label: 'DesignatedHitter', value: 'DesignatedHitter' },
];

const handleSave = async () => {
    console.log({ firstName, lastName, position, dob, height, weight, throws, bats });
    if (firstName === '' || lastName === '' || position === '' || dob === '' || height === '' || weight === '' || throws === '' || bats === ''){
        Alert.alert("Error", "Please fill in all fields")
        return
    }

    const newPlayer: Player = {
        id: Date.now().toString(), // Simple unique ID
        firstName,
        lastName,
        position,
        dob,
        height,
        weight,
        throws,
        bats,
    };

    try {
      // Get existing players
      const existingPlayers = await AsyncStorage.getItem('players');
      const players: Player[] = existingPlayers ? JSON.parse(existingPlayers) : [];
      
      // Add new player
      players.push(newPlayer);
      
      // Save back to storage
      await AsyncStorage.setItem('players', JSON.stringify(players));
      
      Alert.alert('Success', 'Player saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save player');
      console.error(error);
    }
    
};

const onDateChange = (selectedDate?: Date) => {
    setShowDatePicker(false); // Hide picker after selection (Android)
    if (selectedDate) {
        setDob(formatDate(selectedDate));
    }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New Player</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
    <View style={styles.form}>
        {/* Name Row */}
        <View style={styles.row}>
            <View style={styles.halfField}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder=""
            />
            </View>
            <View style={styles.halfField}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder=""
            />
            </View>
        </View>

        {/* Position & DOB Row */}
        <View style={styles.row}>
            <View style={styles.halfField}>
                <Text style={styles.label}>Position</Text>
                <View style={styles.pickerContainer}>
                    <Dropdown style={styles.picker}
                        data={positions}
                        value={position}
                        onChange={(val: {label:string, value:string}) => setPosition(val.value)}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Position"
                    >
                    </Dropdown>
                </View>
            </View>

            <View style={styles.halfField}>
                <Text style={styles.label}>DOB</Text>
                <TouchableOpacity
                    style={styles.inputWithIcon}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateText}>{dob}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={showDatePicker}
                    mode='date'
                    onConfirm={onDateChange}
                    onCancel={() => setShowDatePicker(false)}
                    date={new Date(2005, 0, 1)}
                    // buttonTextColorIOS='#DC2626'
                >
                </DateTimePickerModal>
            </View>
        </View>

        {/* Height & Weight Row */}
        <View style={styles.row}>
            <View style={styles.halfField}>
            <Text style={styles.label}>{`Height (ft' in")`}</Text>
            <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder={"6'2\""}
            />
            </View>
            <View style={styles.halfField}>
            <Text style={styles.label}>Weight (lbs)</Text>
            <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="195"
                keyboardType="numeric"
            />
            </View>
        </View>

        {/* Throws & Bats Row */}
        <View style={styles.row}>
            <View style={styles.halfField}>
            <Text style={styles.label}>Throws</Text>
            <View style={styles.toggleGroup}>
                <TouchableOpacity
                style={[styles.toggleButton, throws === 'R' && styles.toggleActive]}
                onPress={() => setThrows('R')}
                >
                <Text style={[styles.toggleText, throws === 'R' && styles.toggleTextActive]}>R</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.toggleButton, throws === 'L' && styles.toggleActive]}
                onPress={() => setThrows('L')}
                >
                <Text style={[styles.toggleText, throws === 'L' && styles.toggleTextActive]}>L</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.toggleButton, throws === 'S' && styles.toggleActive]}
                onPress={() => setThrows('S')}
                >
                <Text style={[styles.toggleText, throws === 'S' && styles.toggleTextActive]}>S</Text>
                </TouchableOpacity>
            </View>
            </View>
            <View style={styles.halfField}>
            <Text style={styles.label}>Bats</Text>
            <View style={styles.toggleGroup}>
                <TouchableOpacity
                style={[styles.toggleButton, bats === 'R' && styles.toggleActive]}
                onPress={() => setBats('R')}
                >
                <Text style={[styles.toggleText, bats === 'R' && styles.toggleTextActive]}>R</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.toggleButton, bats === 'L' && styles.toggleActive]}
                onPress={() => setBats('L')}
                >
                <Text style={[styles.toggleText, bats === 'L' && styles.toggleTextActive]}>L</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.toggleButton, bats === 'S' && styles.toggleActive]}
                onPress={() => setBats('S')}
                >
                <Text style={[styles.toggleText, bats === 'S' && styles.toggleTextActive]}>S</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View> 
        </View>
        
        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Player Profile</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    position: 'relative'
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    height: '50%'
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  picker:{
    width: '100%'
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  inputWithIcon: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  inputInner: {
    flex: 1,
    fontSize: 16,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#1F2937',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 100,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    position: 'absolute',
    bottom: 28,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  dateText: {
  fontSize: 16,
  color: '#111827',
  },
});