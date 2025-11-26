import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  Player  from '../types/Player';


export default function PlayerScreen() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [])
  );

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

  // // Filter players based on search
  // const filteredPlayers = players.filter(player =>
  //   `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const renderPlayer = ({ item }: { item: Player }) => (
    <TouchableOpacity style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>{item.firstName} {item.lastName}</Text>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{getPositionAbbr(item.position)}</Text>
        </View>
      </View>
      <Text style={styles.playerDetails}>
        Class: {getClassYear(item.dob)}  •  {item.height}, {item.weight}lb  •  B/T: {item.bats}/{item.throws}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Players</Text>
      </View>
      <TouchableOpacity style={styles.addPlayerButton}>
        <Ionicons name="add-outline" style={styles.addPlayerIcon}></Ionicons>
      </TouchableOpacity>

      {/* Player List */}
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No players yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first player</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addPlayerButton} onPress={() => router.push('/addPlayer')}>
        <Ionicons name="add-outline" style={styles.addPlayerIcon}></Ionicons>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6'},
  header: { backgroundColor: '#DC2626', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, alignItems: "center"},
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold'},
  content: { flex: 1, padding: 16 },
  addPlayerButton: {
    backgroundColor: '#DC2626',
    width: 60,
    height: 60,
    borderRadius: 100,
    fontWeight: 200,
    justifyContent: "center",
    position: 'absolute',
    right: "5%",
    bottom: 30
  },
  addPlayerIcon: {
    fontSize: 40,
    color: '#fff',
    alignSelf: 'center'
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  positionBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  playerDetails: {
    fontSize: 14,
    color: '#6B7280',
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
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
