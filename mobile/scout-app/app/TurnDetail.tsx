import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  pitcherName: string;
  batterName: string;
  playerName: string;
  timestamp: string;
  pitches: Pitch[];
  pitchCount: number;
  finalCount: string;
  result: string;
  balls: number;
  strikes: number;
}

export default function TurnDetailScreen() {
  const router = useRouter();
  const { turnId } = useLocalSearchParams();
  const [turn, setTurn] = useState<Turn | null>(null);

  useEffect(() => {
    loadTurn();
  }, [turnId]);

  const loadTurn = async () => {
    try {
      const storedTurns = await AsyncStorage.getItem('currentTurns');
      if (storedTurns) {
        const turns: Turn[] = JSON.parse(storedTurns);
        const found = turns.find((t) => t.id === turnId);
        if (found) {
          setTurn(found);
        }
      }
    } catch (error) {
      console.error('Failed to load turn:', error);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${tenths}`;
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Ball':
        return '#10B981'; // Green
      case 'Strike':
      case 'Foul':
        return '#EF4444'; // Red
      case 'Hit':
        return '#3B82F6'; // Blue
      case 'Out':
        return '#6B7280'; // Gray
      case 'HBP':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280';
    }
  };

  const renderPitch = ({ item, index }: { item: Pitch; index: number }) => (
    <View style={styles.pitchCard}>
      <View style={styles.pitchLeft}>
        <View style={styles.pitchNumber}>
          <Text style={styles.pitchNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.pitchMainInfo}>
          <View style={styles.pitchTopRow}>
            <Text style={styles.pitchResult}>{item.result}</Text>
            <View style={styles.pitchTypeBadge}>
              <Text style={styles.pitchTypeBadgeText}>{item.pitchTypeAbbr}</Text>
            </View>
          </View>
          <Text style={styles.pitchCount}>
            Count after: {item.ballCount}-{item.strikeCount}
          </Text>
        </View>
      </View>
      <View style={styles.pitchRight}>
        <Text style={styles.pitchDuration}>{formatDuration(item.duration)}</Text>
        <Text style={styles.pitchTime}>{item.startTime} → {item.endTime}</Text>
      </View>
    </View>
  );

  if (!turn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Turn Detail</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Turn Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Matchup Display */}
        <View style={styles.matchupContainer}>
          <View style={styles.matchupCard}>
            <View style={styles.playerBox}>
              <Text style={styles.playerLabel}>PITCHER</Text>
              <Text style={styles.playerName}>
                {turn.pitcherName}
              </Text>
            </View>
  
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
  
            <View style={styles.playerBox}>
              <Text style={styles.playerLabel}>BATTER</Text>
              <Text style={styles.playerName}>
                {turn.batterName}
              </Text>
            </View>
          </View>
        </View>


      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{turn.pitches?.filter(p => p.result === 'Ball').length || 0}</Text>
          <Text style={styles.statLabel}>Balls</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{turn.pitches?.filter(p => p.result === 'Strike').length || 0}</Text>
          <Text style={styles.statLabel}>Strikes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{turn.pitches?.filter(p => p.result === 'Foul').length || 0}</Text>
          <Text style={styles.statLabel}>Fouls</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{turn.pitchCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Pitches List */}
      <View style={styles.pitchesSection}>
        <Text style={styles.sectionTitle}>PITCH BY PITCH</Text>
        <FlatList
          data={turn.pitches || []}
          renderItem={renderPitch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.pitchesList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pitch data available</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchupContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  matchupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerBox: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: '#DC2626',
    borderWidth: 1
  },
  countBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  countValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  countDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#4B5563',
  },
  resultBanner: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  resultBannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  resultBannerSub: {
    color: '#FCA5A5',
    fontSize: 12,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  pitchesSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  pitchesList: {
    paddingBottom: 20,
  },
  pitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  pitchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pitchNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pitchNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  pitchMainInfo: {
    flex: 1,
  },
  pitchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pitchResult: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  pitchTypeBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pitchTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  pitchCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  pitchRight: {
    alignItems: 'flex-end',
  },
  pitchDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  pitchTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
  vsContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  vsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
});