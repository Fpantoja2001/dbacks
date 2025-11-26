import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './types/Player';

interface Pitch {
  id: string;
  result: string;
  pitchType: string;
  pitchTypeAbbr: string;
  startTime: string;
  endTime: string;
  duration: number;
  ballCount: number;
  strikeCount: number;
}

interface Turn {
  id: string;
  playerId: string;
  playerName: string;
  pitcherName?: string;
  batterName?: string;
  timestamp: string;
  result?: string;
  pitches?: Pitch[];
  pitchCount?: number;
  balls?: number;
  strikes?: number;
  finalCount?: string;
}

interface Session {
  id: string;
  date: string;
  players: Player[];
}

export default function SessionScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);

  useEffect(() => {
    loadSession();
    loadTurns();
  }, []);

  const loadSession = async () => {
    try {
      const storedSession = await AsyncStorage.getItem('currentSession');
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const loadTurns = async () => {
    try {
      const storedTurns = await AsyncStorage.getItem('currentTurns');
      if (storedTurns) {
        setTurns(JSON.parse(storedTurns));
      }
    } catch (error) {
      console.error('Failed to load turns:', error);
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleAddTurn = () => {
    if (!session || session.players.length === 0) {
      Alert.alert('Error', 'No players in session');
      return;
    }
    // Navigate to add turn screen
    router.push('/TurnSetup');
  };

  const handleEndSession = async () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end and save this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End & Save',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get existing sessions history
              const existingHistory = await AsyncStorage.getItem('sessionHistory');
              const history = existingHistory ? JSON.parse(existingHistory) : [];

              // Save current session to history
              const completedSession = {
                ...session,
                turns,
                completedAt: new Date().toISOString(),
              };
              history.push(completedSession);
              await AsyncStorage.setItem('sessionHistory', JSON.stringify(history));

              // Clear current session
              await AsyncStorage.removeItem('currentSession');
              await AsyncStorage.removeItem('currentTurns');

              router.replace('/(tabs)');
            } catch (error) {
              console.error('Failed to save session:', error);
              Alert.alert('Error', 'Failed to save session');
            }
          },
        },
      ]
    );
  };

  const renderTurn = ({ item, index }: { item: Turn; index: number }) => (
  <TouchableOpacity
    style={styles.turnCard}
    onPress={() => router.push({
      pathname: '/TurnDetail',
      params: { turnId: item.id },
    })}
    activeOpacity={0.7}
  >
    <View style={styles.turnNumber}>
      <Text style={styles.turnNumberText}>{index + 1}</Text>
    </View>
    <View style={styles.turnInfo}>
      <Text style={styles.turnPlayerName}>{item.playerName}</Text>
      <Text style={styles.turnTimestamp}>{item.timestamp}</Text>
    </View>
    {item.result && (
      <View style={styles.turnResult}>
        <Text style={styles.turnResultText}>{item.result}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ marginLeft: 8 }} />
  </TouchableOpacity>
);

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="baseball-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No turns recorded yet.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <View>
          <Text style={styles.sessionTitle}>Session Preview</Text>
          <Text style={styles.sessionMeta}>
            {formatDate()} • {turns.length} Turns
          </Text>
        </View>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      </View>

      {/* Turns List */}
      <View style={styles.turnsContainer}>
        {turns.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={turns}
            renderItem={renderTurn}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.turnsList}
          />
        )}
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addTurnButton} onPress={handleAddTurn}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addTurnButtonText}>Add Turn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endSessionButton} onPress={handleEndSession}>
          <Ionicons name="save-outline" size={20} color="#DC2626" />
          <Text style={styles.endSessionButtonText}>End Session & Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sessionInfo: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sessionMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  liveBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  turnsContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  turnsList: {
    padding: 16,
  },
  turnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  turnNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  turnNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  turnInfo: {
    flex: 1,
  },
  turnPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  turnTimestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  turnResult: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  turnResultText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  addTurnButton: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  addTurnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  endSessionButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 8,
  },
  endSessionButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});