import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Player from '../types/Player';

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

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('sessionHistory');
      if (storedHistory) {
        const history = JSON.parse(storedHistory);
        history.sort((a: Session, b: Session) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        setSessions(history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSessionPress = (session: Session) => {
    router.push({
      pathname: '/historySessionDetail',
      params: { sessionId: session.id },
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

            // Build row with all 68 columns
            const row = [
              pitchNo,                              // PitchNo
              dateStr,                              // Date
              timeStr,                              // Time
              `"${turn.pitcherName || ''}"`,        // Pitcher
              '',                                   // PitcherId
              '',                                   // PitcherThrows
              '',                                   // PitcherTeam
              '',                                   // PitcherSet
              taggedPitchType,                      // TaggedPitchType
              'Live',                               // PitchSession
              '',                                   // Flag
              pitch.mph || '',                      // RelSpeed (MPH)
              '',                                   // VertRelAngle
              '',                                   // HorzRelAngle
              '',                                   // SpinRate
              '',                                   // SpinAxis
              '',                                   // Tilt
              '',                                   // RelHeight
              '',                                   // RelSide
              '',                                   // Extension
              '',                                   // VertBreak
              '',                                   // InducedVertBreak
              '',                                   // HorzBreak
              '',                                   // PlateLocHeight
              '',                                   // PlateLocSide
              '',                                   // ZoneSpeed
              '',                                   // VertApprAngle
              '',                                   // HorzApprAngle
              '',                                   // ZoneTime
              '',                                   // pfxx
              '',                                   // pfxz
              '',                                   // x0
              '',                                   // y0
              '',                                   // z0
              '',                                   // vx0
              '',                                   // vy0
              '',                                   // vz0
              '',                                   // ax0
              '',                                   // ay0
              '',                                   // az0
              '',                                   // CalibrationId
              '',                                   // EffVelocity
              'Pitching',                           // PracticeType
              '',                                   // Device
              '',                                   // Direction
              '',                                   // BatterId
              `"${turn.batterName || turn.playerName || ''}"`, // Batter
              '',                                   // HitSpinRate
              '',                                   // HitType
              '',                                   // ExitSpeed
              '',                                   // BatterSide
              '',                                   // Angle
              '',                                   // PositionAt110X
              '',                                   // PositionAt110Y
              '',                                   // PositionAt110Z
              '',                                   // Distance
              '',                                   // LastTrackedDistance
              '',                                   // HangTime
              '',                                   // Bearing
              '',                                   // ContactPositionX
              '',                                   // ContactPositionY
              '',                                   // ContactPositionZ
              '',                                   // SpinAxis3dTransverseAngle
              '',                                   // SpinAxis3dLongitudinalAngle
              '',                                   // SpinAxis3dActiveSpinRate
              '',                                   // SpinAxis3dSpinEfficiency
              '',                                   // SpinAxis3dTilt
              pitch.id || '',                       // PlayID
            ];

            csvContent += row.join(',') + '\n';
            pitchNo++;
          });
        }
    });

      // Create file using new expo-file-system API
      const fileName = `Trackman_Session_${dateStr}_${Date.now()}.csv`;
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

  const handleExportText = async (session: Session) => {
    let exportText = `SESSION REPORT\n`;
    exportText += `Date: ${formatDate(session.completedAt)}\n`;
    exportText += `Time: ${formatTime(session.completedAt)}\n`;
    exportText += `Players: ${session.players.length}\n`;
    exportText += `Total Turns: ${session.turns.length}\n\n`;

    exportText += `--- ROSTER ---\n`;
    session.players.forEach((player) => {
      exportText += `• ${player.firstName} ${player.lastName} (${player.position})\n`;
    });

    exportText += `\n--- TURNS ---\n`;
    session.turns.forEach((turn, index) => {
      exportText += `${index + 1}. ${turn.playerName} - ${turn.result} (${turn.timestamp})\n`;
      if (turn.pitches && turn.pitches.length > 0) {
        turn.pitches.forEach((pitch, pIndex) => {
          exportText += `   Pitch ${pIndex + 1}: ${pitch.pitchType} - ${pitch.result}${pitch.mph ? ` @ ${pitch.mph} mph` : ''}\n`;
        });
      }
    });

    exportText += `\n--- STATS SUMMARY ---\n`;
    const resultCounts: { [key: string]: number } = {};
    session.turns.forEach((turn) => {
      if (turn.result) {
        resultCounts[turn.result] = (resultCounts[turn.result] || 0) + 1;
      }
    });
    Object.entries(resultCounts).forEach(([result, count]) => {
      exportText += `${result}: ${count}\n`;
    });

    try {
      await Share.share({
        message: exportText,
        title: `Session Report - ${formatDate(session.completedAt)}`,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleExport = (session: Session) => {
    Alert.alert(
      'Export Session',
      'Choose export format',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Text Report', onPress: () => handleExportText(session) },
        { text: 'CSV File', onPress: () => handleExportCSV(session) },
      ]
    );
  };

  const handleDelete = (session: Session) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedSessions = sessions.filter((s) => s.id !== session.id);
              await AsyncStorage.setItem('sessionHistory', JSON.stringify(updatedSessions));
              setSessions(updatedSessions);
            } catch (error) {
              console.error('Failed to delete session:', error);
            }
          },
        },
      ]
    );
  };

  const getTotalPitches = (turns: Turn[]) => {
    return turns.reduce((total, turn) => total + (turn.pitches?.length || 0), 0);
  };

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleSessionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDate}>{formatDate(item.completedAt)}</Text>
          <Text style={styles.sessionMeta}>
            {item.players.length} Players • {item.turns.length} Turns • {getTotalPitches(item.turns)} Pitches
          </Text>
        </View>
        <View style={styles.sessionActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleExport(item);
            }}
          >
            <Ionicons name="share-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickStats}>
        {getTopResults(item.turns).map((stat, index) => (
          <View key={index} style={styles.statBadge}>
            <Text style={styles.statText}>{stat.result}: {stat.count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.viewMore}>
        <Text style={styles.viewMoreText}>Tap to view details</Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const getTopResults = (turns: Turn[]) => {
    const resultCounts: { [key: string]: number } = {};
    turns.forEach((turn) => {
      if (turn.result) {
        resultCounts[turn.result] = (resultCounts[turn.result] || 0) + 1;
      }
    });

    return Object.entries(resultCounts)
      .map(([result, count]) => ({ result, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Sessions Yet</Text>
      <Text style={styles.emptyText}>
        Complete a session to see it here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sessionMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewMoreText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});