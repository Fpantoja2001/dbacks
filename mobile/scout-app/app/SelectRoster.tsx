import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './types/Player';

export default function SelectRosterScreen() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      checkSessionActive()
      loadPlayers();
    }, [])
  );

  const checkSessionActive = async () => {
    try {
      const storedCurrentSession = await AsyncStorage.getItem('currentSession')
      if (storedCurrentSession) {
        router.push('/Session');
      }
      return
    } catch (error) {
      console.error('Failed to load current session:', error)
    }
  }

  const loadPlayers = async () => {
    try {
      const storedPlayers = await AsyncStorage.getItem('players');
      if (storedPlayers) {
        setPlayers(JSON.parse(storedPlayers));
      }
    } catch (error) {
      console.error('Failed to load players:', error);
    }
  };

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((playerId) => playerId !== id)
        : [...prev, id]
    );
  };

  const getClassYear = (dobString: string) => {
      const parts = dobString.split('/');
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);

      // Cutoff date is August 31st of birth year
      const birthDate = new Date(year, month - 1, day);
      const cutoffDate = new Date(year, 7, 31); // August is month 7 (0-indexed)

      if (birthDate <= cutoffDate) {
        return year + 17;
      } else {
        return year + 18;
      }
  };  

  const getPositionAbbr = (position: string) => {
    const abbrs: { [key: string]: string } = {
      'Pitcher': 'P',
      'Catcher': 'C',
      'First Base': '1B',
      'Second Base': '2B',
      'Shortstop': 'SS',
      'Third Base': '3B',
      'Outfield': 'OF',
    };
    return abbrs[position] || position;
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) return;

    // Get selected players
    const selectedPlayers = players.filter((p) => selectedIds.includes(p.id));

    // Save session roster to AsyncStorage
    const session = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      players: selectedPlayers,
    };

    try {
      await AsyncStorage.setItem('currentSession', JSON.stringify(session));
      // Navigate to session screen
      router.push('/Session');
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const renderPlayer = ({ item }: { item: Player }) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.playerRow}
        onPress={() => togglePlayer(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.playerDetails}>
            {getPositionAbbr(item.position)} • Class {getClassYear(item.dob)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const isButtonDisabled = selectedIds.length === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Session Roster</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Subheader */}
      <View style={styles.subheader}>
        <Text style={styles.subheaderTitle}>Session Roster</Text>
        <Text style={styles.subheaderText}>Select everyone present today.</Text>
      </View>

      {/* Player List */}
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No players available</Text>
            <Text style={styles.emptySubtext}>Add players first in the Players tab</Text>
          </View>
        }
      />

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isButtonDisabled && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={isButtonDisabled}
        >
          <Text style={[styles.confirmButtonText, isButtonDisabled && styles.confirmButtonTextDisabled]}>
            Confirm Roster ({selectedIds.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  subheader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subheaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subheaderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  playerDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
});