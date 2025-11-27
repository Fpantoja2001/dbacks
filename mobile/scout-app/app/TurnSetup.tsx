import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './types/Player';

export default function TurnSetupScreen() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPitcher, setSelectedPitcher] = useState<Player | null>(null);
  const [selectedBatter, setSelectedBatter] = useState<Player | null>(null);

  useEffect(() => {
    loadSessionPlayers();
  }, []);

  const loadSessionPlayers = async () => {
    try {
      const storedSession = await AsyncStorage.getItem('currentSession');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        setPlayers(session.players);
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

        const birthDate = new Date(year, month - 1, day);
        const cutoffDate = new Date(year, 7, 31); // August 31st

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
      'Leftfield': 'LF',
      'Rightfield': 'RF',
      'Centerfield': 'CF',
      'DesignatedHitter': 'DH'
    };
    return abbrs[position] || position;
  };

  const handleSelectPitcher = (player: Player) => {
    // If this player is currently the batter, clear batter
    if (selectedBatter?.id === player.id) {
      setSelectedBatter(null);
    }
    setSelectedPitcher(player);
  };

  const handleSelectBatter = (player: Player) => {
    // If this player is currently the pitcher, clear pitcher
    if (selectedPitcher?.id === player.id) {
      setSelectedPitcher(null);
    }
    setSelectedBatter(player);
  };

  const handleEnterTurnMode = async () => {
    if (!selectedPitcher || !selectedBatter) return;

    const turnSetup = {
      pitcher: selectedPitcher,
      batter: selectedBatter,
    };

    try {
      await AsyncStorage.setItem('currentTurnSetup', JSON.stringify(turnSetup));
      router.push('/addTurn');
    } catch (error) {
      console.error('Failed to save turn setup:', error);
    }
  };

  const renderPitcherCard = ({ item }: { item: Player }) => {
    const isSelected = selectedPitcher?.id === item.id;
    const isDisabled = selectedBatter?.id === item.id;

    return (
        <TouchableOpacity
        style={[
            styles.playerCard,
            isSelected && styles.pitcherCardSelected,
            isDisabled && styles.playerCardDisabled,
        ]}
        onPress={() => !isDisabled && handleSelectPitcher(item)}
        activeOpacity={isDisabled ? 1 : 0.7}
        >
        <Text
            style={[
            styles.playerName,
            isSelected && styles.playerNameSelected,
            isDisabled && styles.playerNameDisabled,
            ]}
        >
            {item.firstName} {item.lastName}
        </Text>
        <Text
            style={[
            styles.playerPosition,
            isSelected && styles.pitcherPositionSelected,
            isDisabled && styles.playerPositionDisabled,
            ]}
        >
            {getPositionAbbr(item.position)} • Class {getClassYear(item.dob)}
        </Text>
        {isDisabled && (
            <View style={styles.disabledBadge}>
            {/* <Text style={styles.disabledBadgeText}>Batting</Text> */}
            </View>
        )}
        </TouchableOpacity>
    );
  };

  const renderBatterCard = ({ item }: { item: Player }) => {
    const isSelected = selectedBatter?.id === item.id;
    const isDisabled = selectedPitcher?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          isSelected && styles.batterCardSelected,
          isDisabled && styles.playerCardDisabled,
        ]}
        onPress={() => !isDisabled && handleSelectBatter(item)}
        activeOpacity={isDisabled ? 1 : 0.7}
      >
        <Text
          style={[
            styles.playerName,
            isSelected && styles.playerNameSelected,
            isDisabled && styles.playerNameDisabled,
          ]}
        >
          {item.firstName} {item.lastName}
        </Text>
        <Text
          style={[
            styles.playerPosition,
            isSelected && styles.batterPositionSelected,
            isDisabled && styles.playerPositionDisabled,
          ]}
        >
          {getPositionAbbr(item.position)} • Class {getClassYear(item.dob)}
        </Text>
        {isDisabled && (
          <View style={styles.disabledBadge}>
            {/* <Text style={styles.disabledBadgeText}>Pitching</Text> */}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const isButtonDisabled = !selectedPitcher || !selectedBatter;

  return (
    <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Turn Setup</Text>
        <View style={{ width: 24 }} />
        </View>

        {/* Subheader */}
        <View style={styles.subheader}>
        <Text style={styles.subheaderTitle}>Who is up?</Text>
        <Text style={styles.subheaderText}>Select players from active roster.</Text>
        </View>

        <ScrollView style={styles.content}>
        {/* Pitcher Selection */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>PITCHER</Text>
            <View style={styles.playersGrid}>
            {players.map((item) => {
                const isSelected = selectedPitcher?.id === item.id;
                const isDisabled = selectedBatter?.id === item.id;

                if (item.position !== 'Pitcher') {
                    return;
                }

                return (
                <TouchableOpacity
                    key={`pitcher-${item.id}`}
                    style={[
                    styles.playerCard,
                    isSelected && styles.pitcherCardSelected,
                    isDisabled && styles.playerCardDisabled,
                    ]}
                    onPress={() => !isDisabled && handleSelectPitcher(item)}
                    activeOpacity={isDisabled ? 1 : 0.7}
                >
                    <Text
                    style={[
                        styles.playerName,
                        isSelected && styles.playerNameSelected,
                        isDisabled && styles.playerNameDisabled,
                    ]}
                    >
                    {item.firstName} {item.lastName}
                    </Text>
                    <Text
                    style={[
                        styles.playerPosition,
                        isSelected && styles.pitcherPositionSelected,
                        isDisabled && styles.playerPositionDisabled,
                    ]}
                    >
                    {getPositionAbbr(item.position)} • Class {getClassYear(item.dob)}
                    </Text>
                    {isDisabled && (
                    <View style={styles.disabledBadge}>
                        {/* <Text style={styles.disabledBadgeText}>Batting</Text> */}
                    </View>
                    )}
                </TouchableOpacity>
                );
            })}
            </View>
        </View>

        {/* Batter Selection */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>BATTER</Text>
            <View style={styles.playersGrid}>
            {players.map((item) => {
                const isSelected = selectedBatter?.id === item.id;
                const isDisabled = selectedPitcher?.id === item.id;

                return (
                <TouchableOpacity
                    key={`batter-${item.id}`}
                    style={[
                    styles.playerCard,
                    isSelected && styles.batterCardSelected,
                    isDisabled && styles.playerCardDisabled,
                    ]}
                    onPress={() => !isDisabled && handleSelectBatter(item)}
                    activeOpacity={isDisabled ? 1 : 0.7}
                >
                    <Text
                    style={[
                        styles.playerName,
                        isSelected && styles.playerNameSelected,
                        isDisabled && styles.playerNameDisabled,
                    ]}
                    >
                    {item.firstName} {item.lastName}
                    </Text>
                    <Text
                    style={[
                        styles.playerPosition,
                        isSelected && styles.batterPositionSelected,
                        isDisabled && styles.playerPositionDisabled,
                    ]}
                    >
                    {getPositionAbbr(item.position)} • Class {getClassYear(item.dob)}
                    </Text>
                    {isDisabled && (
                    <View style={styles.disabledBadge}>
                        {/* <Text style={styles.disabledBadgeText}>Pitching</Text> */}
                    </View>
                    )}
                </TouchableOpacity>
                );
            })}
            </View>
        </View>
        </ScrollView>

        {/* Enter Turn Mode Button */}
        <View style={styles.footer}>
        <TouchableOpacity
            style={[styles.enterButton, isButtonDisabled && styles.enterButtonDisabled]}
            onPress={handleEnterTurnMode}
            disabled={isButtonDisabled}
        >
            <Text style={[styles.enterButtonText, isButtonDisabled && styles.enterButtonTextDisabled]}>
            Enter Turn Mode
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
  subheader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subheaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  subheaderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  // Disabled styles
  playerCardDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  playerNameDisabled: {
    color: '#9CA3AF',
  },
  playerPositionDisabled: {
    color: '#D1D5DB',
  },
  disabledBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 4,
  },
  disabledBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Pitcher selected styles (green)
  pitcherCardSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  pitcherPositionSelected: {
    color: '#DC2626',
  },
  // Batter selected styles (blue)
  batterCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  batterPositionSelected: {
    color: '#3B82F6',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  playerNameSelected: {
    color: '#111827',
  },
  playerPosition: {
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
  enterButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  enterButtonDisabled: {
    backgroundColor: '#FECACA',
  },
  enterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  enterButtonTextDisabled: {
    color: '#FCA5A5',
  },
});