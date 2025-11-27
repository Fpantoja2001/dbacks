import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './types/Player';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';


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
  mph: number | null;
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
  turns: Turn[];
  completedAt: string;
}

export default function HistorySessionDetailScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('sessionHistory');
      if (storedHistory) {
        const history: Session[] = JSON.parse(storedHistory);
        const found = history.find((s) => s.id === sessionId);
        if (found) {
          setSession(found);
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleTurnPress = (turn: Turn) => {
    router.push({
      pathname: '/historyTurnDetail',
      params: { 
        sessionId: session?.id,
        turnId: turn.id,
      },
    });
  };

    const handleExportCSV = async (session: Session) => {
        try {
            // Trackman CSV Header - all 68 columns
            const headers = [
            'PitchNo',
            'Date',
            'Time',
            'Pitcher',
            'PitcherId',
            'PitcherThrows',
            'PitcherTeam',
            'PitcherSet',
            'TaggedPitchType',
            'PitchSession',
            'Flag',
            'RelSpeed',
            'VertRelAngle',
            'HorzRelAngle',
            'SpinRate',
            'SpinAxis',
            'Tilt',
            'RelHeight',
            'RelSide',
            'Extension',
            'VertBreak',
            'InducedVertBreak',
            'HorzBreak',
            'PlateLocHeight',
            'PlateLocSide',
            'ZoneSpeed',
            'VertApprAngle',
            'HorzApprAngle',
            'ZoneTime',
            'pfxx',
            'pfxz',
            'x0',
            'y0',
            'z0',
            'vx0',
            'vy0',
            'vz0',
            'ax0',
            'ay0',
            'az0',
            'CalibrationId',
            'EffVelocity',
            'PracticeType',
            'Device',
            'Direction',
            'BatterId',
            'Batter',
            'HitSpinRate',
            'HitType',
            'ExitSpeed',
            'BatterSide',
            'Angle',
            'PositionAt110X',
            'PositionAt110Y',
            'PositionAt110Z',
            'Distance',
            'LastTrackedDistance',
            'HangTime',
            'Bearing',
            'ContactPositionX',
            'ContactPositionY',
            'ContactPositionZ',
            'SpinAxis3dTransverseAngle',
            'SpinAxis3dLongitudinalAngle',
            'SpinAxis3dActiveSpinRate',
            'SpinAxis3dSpinEfficiency',
            'SpinAxis3dTilt',
            'PlayID',
            ];

            let csvContent = headers.join(',') + '\n';

            // Get session date
            const sessionDate = new Date(session.completedAt);
            const dateStr = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD format

            // Pitch counter across all turns
            let pitchNo = 1;

            // Add each pitch from each turn
            session.turns.forEach((turn) => {
            if (turn.pitches && turn.pitches.length > 0) {
                turn.pitches.forEach((pitch) => {
                // Map our pitch type to Trackman format
                const pitchTypeMap: { [key: string]: string } = {
                    'Fastball': 'Fastball',
                    'Curveball': 'Curveball',
                    'Changeup': 'ChangeUp',
                    'Slider': 'Slider',
                };
                const taggedPitchType = pitchTypeMap[pitch.pitchType] || pitch.pitchType;

                // Format time (remove AM/PM, keep HH:MM:SS format)
                const timeStr = pitch.startTime || '';

                const reformatName = (name: string | undefined): string => {
                    if (!name) return '';
                    
                    // Trim and remove extra spaces
                    const cleanedName = name.trim().replace(/\s+/g, ' ');
                    const parts = cleanedName.split(' ');
                    
                    if (parts.length < 2) return cleanedName;
                    
                    // Last name is the last part, first name is everything else
                    const lastName = parts[parts.length - 1];
                    const firstName = parts.slice(0, -1).join(' ');
                    
                    // Format: "LastName, FirstName" (single comma, single space)
                    return `${lastName}, ${firstName}`;
                };

                const convertTo24Hour = (time12h?: string): string => {
                    if (!time12h) return '';

                    // Normalize: trim, collapse spaces, uppercase
                    const clean = time12h.trim().replace(/\s+/g, ' ').toUpperCase();

                    // Extract time + AM/PM using regex
                    const match = clean.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s?(AM|PM)$/);
                    if (!match) return time12h; // Unexpected format → return original

                    const [_, time, period] = match;
                    let [h, m, s] = time.split(':');

                    let hour = parseInt(h, 10);

                    if (period === 'PM' && hour !== 12) hour += 12;
                    if (period === 'AM' && hour === 12) hour = 0;

                    const hh = hour.toString().padStart(2, '0');

                    return s ? `${hh}:${m}:${s}` : `${hh}:${m}`;
                };

                // Build row with all 68 columns
                const row = [
                    pitchNo,                                            // PitchNo
                    dateStr,                                            // Date
                    convertTo24Hour(timeStr),                                            // Time
                    `"${reformatName(turn.pitcherName)}"`,        // Pitcher
                    '',                                                 // PitcherId
                    '',                                                 // PitcherThrows
                    '',                                                 // PitcherTeam
                    '',                                                 // PitcherSet
                    taggedPitchType,                                    // TaggedPitchType
                    'Live',                                             // PitchSession
                    '',                                                 // Flag
                    pitch.mph || '',                                    // RelSpeed (MPH)
                    '',                                                 // VertRelAngle
                    '',                                                 // HorzRelAngle
                    '',                                                 // SpinRate
                    '',                                                 // SpinAxis
                    '',                                                 // Tilt
                    '',                                                 // RelHeight
                    '',                                                 // RelSide
                    '',                                                 // Extension
                    '',                                                 // VertBreak
                    '',                                                 // InducedVertBreak
                    '',                                                 // HorzBreak
                    '',                                                 // PlateLocHeight
                    '',                                                 // PlateLocSide
                    '',                                                 // ZoneSpeed
                    '',                                                 // VertApprAngle
                    '',                                                 // HorzApprAngle
                    '',                                                 // ZoneTime
                    '',                                                 // pfxx
                    '',                                                 // pfxz
                    '',                                                 // x0
                    '',                                                 // y0
                    '',                                                 // z0
                    '',                                                 // vx0
                    '',                                                 // vy0
                    '',                                                 // vz0
                    '',                                                 // ax0
                    '',                                                 // ay0
                    '',                                                 // az0
                    '',                                                 // CalibrationId
                    '',                                                 // EffVelocity
                    'Pitching',                                         // PracticeType
                    '',                                                 // Device
                    '',                                                 // Direction
                    '',                                                 // BatterId
                    `"${reformatName(turn.batterName) || reformatName(turn.playerName)}"`, // Batter
                    '',                                                 // HitSpinRate
                    '',                                                 // HitType
                    '',                                                 // ExitSpeed
                    '',                                                 // BatterSide
                    '',                                                 // Angle
                    '',                                                 // PositionAt110X
                    '',                                                 // PositionAt110Y
                    '',                                                 // PositionAt110Z
                    '',                                                 // Distance
                    '',                                                 // LastTrackedDistance
                    '',                                                 // HangTime
                    '',                                                 // Bearing
                    '',                                                 // ContactPositionX
                    '',                                                 // ContactPositionY
                    '',                                                 // ContactPositionZ
                    '',                                                 // SpinAxis3dTransverseAngle
                    '',                                                 // SpinAxis3dLongitudinalAngle
                    '',                                                 // SpinAxis3dActiveSpinRate
                    '',                                                 // SpinAxis3dSpinEfficiency
                    '',                                                 // SpinAxis3dTilt
                    pitch.id || '',                                     // PlayID
                ];

                csvContent += row.join(',') + '\n';
                pitchNo++;
                });
            }
            });

            // Create file using new expo-file-system API
            const fileName = `Session_${dateStr}_${Date.now()}.csv`;
            const file = new File(Paths.cache, fileName);
            
            // Write content to file
            file.write(csvContent);

            // Share the file
            if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(file.uri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Session Data',
            });
            } else {
            // Fallback to Share API with text
            await Share.share({
                message: csvContent,
                title: `Session Export - ${formatDate(session.completedAt)}`,
            });
            }
        } catch (error) {
            console.error('Failed to export CSV:', error);
            Alert.alert('Export Failed', 'Could not export session data. Please try again.');
        }
    };

    const getTotalPitches = () => {
        if (!session) return 0;
        return session.turns.reduce((total, turn) => total + (turn.pitches?.length || 0), 0);
    };

  const renderTurn = ({ item, index }: { item: Turn; index: number }) => (
    <TouchableOpacity
      style={styles.turnCard}
      onPress={() => handleTurnPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.turnNumber}>
        <Text style={styles.turnNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.turnInfo}>
        <Text style={styles.turnPlayerName}>{item.playerName}</Text>
        <Text style={styles.turnMeta}>
          {item.timestamp} • {item.pitchCount || 0} pitches
        </Text>
      </View>
      {item.result && (
        <View style={styles.turnResult}>
          <Text style={styles.turnResultText}>{item.result}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Details</Text>
        <TouchableOpacity onPress={() => handleExportCSV(session)}>
          <Ionicons name="download-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionDate}>{formatDate(session.completedAt)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{session.players.length}</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{session.turns.length}</Text>
            <Text style={styles.statLabel}>Turns</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalPitches()}</Text>
            <Text style={styles.statLabel}>Pitches</Text>
          </View>
        </View>
      </View>

      {/* Turns List */}
      <View style={styles.turnsSection}>
        <Text style={styles.sectionTitle}>TURNS</Text>
        <FlatList
          data={session.turns}
          renderItem={renderTurn}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.turnsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No turns recorded</Text>
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
    backgroundColor: '#D00000',
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
  sessionInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sessionDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D00000',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  turnsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  turnsList: {
    paddingBottom: 20,
  },
  turnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  turnNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D00000',
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
  turnMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  turnResult: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  turnResultText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
});