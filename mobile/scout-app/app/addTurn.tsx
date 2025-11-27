import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './types/Player';

const RESULTS = ['Ball', 'Strike', 'Foul', 'Hit', 'Out', 'HBP'];

const PITCH_TYPES = [
  { label: 'Fastball', abbr: 'FB' },
  { label: 'Curveball', abbr: 'CB' },
  { label: 'Changeup', abbr: 'CH' },
  { label: 'Slider', abbr: 'SL' },
];

interface TurnSetup {
  pitcher: Player;
  batter: Player;
}

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

export default function AddTurnScreen() {
    const router = useRouter();
    const [turnSetup, setTurnSetup] = useState<TurnSetup | null>(null);
    const [pitches, setPitches] = useState<Pitch[]>([]);
    const [selectedResult, setSelectedResult] = useState<string>('');
    const [selectedPitchType, setSelectedPitchType] = useState<{ label: string; abbr: string } | null>(null);

    // Count state
    const [balls, setBalls] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [turnEnded, setTurnEnded] = useState(false);
    const [turnEndReason, setTurnEndReason] = useState<string>('');
  
    // Stopwatch state
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isTimerStopped, setIsTimerStopped] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [displayTime, setDisplayTime] = useState('00:00.0');

    // MPH Modal state
    const [showMphModal, setShowMphModal] = useState(false);
    const [mphValue, setMphValue] = useState('');
    const [pendingPitch, setPendingPitch] = useState<Omit<Pitch, 'mph'> | null>(null);

    useEffect(() => {
        loadTurnSetup();
    }, []);

    // Timer display update
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (isTimerRunning && startTime) {
            interval = setInterval(() => {
                const elapsed = Date.now() - startTime.getTime();
                setDisplayTime(formatElapsedTime(elapsed));
            }, 100);
        }
        
        return () => clearInterval(interval);
    }, [isTimerRunning, startTime]);


    // Show MPH modal when both selections are made
    useEffect(() => {
        if (isTimerStopped && selectedPitchType && selectedResult) {
        preparePitchAndShowModal();
        }
    }, [isTimerStopped, selectedPitchType, selectedResult]);

    const loadTurnSetup = async () => {
        try {
            const storedSetup = await AsyncStorage.getItem('currentTurnSetup');
        if (storedSetup) {
            setTurnSetup(JSON.parse(storedSetup));
        }
        } catch (error) {
            console.error('Failed to load turn setup:', error);
        }
    };

    const formatElapsedTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const tenths = Math.floor((ms % 1000) / 100);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${tenths}`;
    };

    const formatTimeOfDay = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
        
        // Format: HH:MM:SS.mmm (e.g., 16:22:16.453)
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    };

    const calculateNewCount = (result: string) => {
        let newBalls = balls;
        let newStrikes = strikes;
        let ended = false;
        let endReason = '';

        switch (result) {
        case 'Ball':
            newBalls = balls + 1;
            if (newBalls >= 4) {
            ended = true;
            endReason = 'Walk (4 Balls)';
            }
            break;
        case 'Strike':
            newStrikes = strikes + 1;
            if (newStrikes >= 3) {
            ended = true;
            endReason = 'Strikeout (3 Strikes)';
            }
            break;
        case 'Foul':
            if (strikes < 2) {
            newStrikes = strikes + 1;
            }
            break;
        case 'Hit':
            ended = true;
            endReason = 'Hit';
            break;
        case 'Out':
            ended = true;
            endReason = 'Out';
            break;
        case 'HBP':
            ended = true;
            endReason = 'Hit By Pitch';
            break;
        }

        return { newBalls, newStrikes, ended, endReason };
    };

    const preparePitchAndShowModal = () => {
    if (!startTime || !endTime || !selectedPitchType || !selectedResult) return;

    const duration = endTime.getTime() - startTime.getTime();
    const { newBalls, newStrikes } = calculateNewCount(selectedResult);

    const pitch: Omit<Pitch, 'mph'> = {
      id: Date.now().toString(),
      result: selectedResult,
      pitchType: selectedPitchType.label,
      pitchTypeAbbr: selectedPitchType.abbr,
      startTime: formatTimeOfDay(startTime),
      endTime: formatTimeOfDay(endTime),
      duration,
      ballCount: newBalls,
      strikeCount: newStrikes,
    };

    setPendingPitch(pitch);
    setMphValue('');
    setShowMphModal(true);
  };

  const savePitchWithMph = (mph: number | null) => {
    if (!pendingPitch) return;

    const { newBalls, newStrikes, ended, endReason } = calculateNewCount(pendingPitch.result);

    const newPitch: Pitch = {
      ...pendingPitch,
      mph,
    };

    setPitches((prev) => [...prev, newPitch]);
    setBalls(newBalls);
    setStrikes(newStrikes);

    if (ended) {
      setTurnEnded(true);
      setTurnEndReason(endReason);
    }

    // Reset for next pitch
    setShowMphModal(false);
    setPendingPitch(null);
    setMphValue('');
    setIsTimerStopped(false);
    setStartTime(null);
    setEndTime(null);
    setSelectedResult('');
    setSelectedPitchType(null);
    setDisplayTime('00:00.0');
  };

    const handleMphSubmit = () => {
        const mph = mphValue.trim() ? parseFloat(mphValue) : null;
        if (mphValue.trim() && (isNaN(mph!) || mph! < 0 || mph! > 120)) {
            Alert.alert('Invalid Speed', 'Please enter a valid speed between 0 and 120 MPH.');
            return;
        }
        savePitchWithMph(mph);
    };

    const handleMphSkip = () => {
        savePitchWithMph(null);
    };


    const handleTimerPress = () => {
        if (turnEnded) {
            Alert.alert('Turn Ended', `This at-bat has ended: ${turnEndReason}. Save the turn to continue.`);
            return;
        }

        if (isTimerStopped) {
            // Timer already stopped, waiting for selections - do nothing or show hint
            Alert.alert('Select Options', 'Please select pitch type and result to save this pitch.');
            return;
        }

        if (!isTimerRunning) {
            // Start timer
            setStartTime(new Date());
            setIsTimerRunning(true);
            setDisplayTime('00:00.0');
        } else {
            // Stop timer
            setEndTime(new Date());
            setIsTimerRunning(false);
            setIsTimerStopped(true);
        }
    };

    const handleDeletePitch = (pitchId: string) => {
        // Find the pitch index
        const pitchIndex = pitches.findIndex((p) => p.id === pitchId);
        if (pitchIndex === -1) return;

        // Only allow deleting the last pitch to keep count accurate
        if (pitchIndex !== pitches.length - 1) {
            Alert.alert('Cannot Delete', 'You can only delete the most recent pitch to keep the count accurate.');
            return;
        }

        // Recalculate count from remaining pitches
        const newPitches = pitches.slice(0, -1);
        let newBalls = 0;
        let newStrikes = 0;

        newPitches.forEach((pitch) => {
            switch (pitch.result) {
                case 'Ball':
                newBalls++;
                break;
                case 'Strike Call':
                case 'Swing and Miss':
                newStrikes++;
                break;
                case 'Foul':
                if (newStrikes < 2) newStrikes++;
                break;
            }
        });

        setPitches(newPitches);
        setBalls(newBalls);
        setStrikes(newStrikes);
        setTurnEnded(false);
        setTurnEndReason('');
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

  const handleSaveTurn = async () => {
    if (!turnSetup) return;

    if (pitches.length === 0) {
      Alert.alert('No Pitches', 'Please record at least one pitch before saving.');
      return;
    }

    const newTurn = {
        id: Date.now().toString(),
        pitcherId: turnSetup.pitcher.id,
        pitcherName: `${turnSetup.pitcher.firstName} ${turnSetup.pitcher.lastName}`,
        batterId: turnSetup.batter.id,
        batterName: `${turnSetup.batter.firstName} ${turnSetup.batter.lastName}`,
        playerId: turnSetup.batter.id,
        playerName: `${turnSetup.batter.firstName} ${turnSetup.batter.lastName}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pitches: pitches,
        pitchCount: pitches.length,
        finalCount: `${balls}-${strikes}`,
        result: turnEndReason || pitches[pitches.length - 1].result,
        balls,
        strikes,
    };

    try {
      const existingTurns = await AsyncStorage.getItem('currentTurns');
      const turns = existingTurns ? JSON.parse(existingTurns) : [];
      turns.push(newTurn);
      await AsyncStorage.setItem('currentTurns', JSON.stringify(turns));

      await AsyncStorage.removeItem('currentTurnSetup');

      router.replace('/Session');
    } catch (error) {
      console.error('Failed to save turn:', error);
    }
  };

  const renderPitch = ({ item, index }: { item: Pitch; index: number }) => (
    <View style={styles.pitchCard}>
      <View style={styles.pitchInfo}>
        <View style={styles.pitchTypeBadge}>
            <Text style={styles.pitchNumberText}>Turn #{index + 1}</Text>
            <Text style={styles.pitchResult}>{item.result}</Text>
            <Text style={styles.pitchTypeBadgeText}>{item.pitchTypeAbbr}</Text>
        </View>
        <Text style={styles.pitchTime}>
          {item.startTime} → {item.endTime} : {`${item.mph ? `${item.mph} MPH` : `N/A`}`}
        </Text>
      </View>
      <Text style={styles.pitchDuration}>{formatElapsedTime(item.duration)}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePitch(item.id)}
      >
        <Ionicons name="close-circle" size={25} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (!turnSetup) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Turn</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Turn</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Matchup Display */}
      <View style={styles.matchupContainer}>
        <View style={styles.matchupCard}>
          <View style={styles.playerBox}>
            <Text style={styles.playerLabel}>PITCHER</Text>
            <Text style={styles.playerName}>
              {turnSetup.pitcher.firstName} {turnSetup.pitcher.lastName}
            </Text>
            <Text style={styles.playerPosition}>
              {getPositionAbbr(turnSetup.pitcher.position)}
            </Text>
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.playerBox}>
            <Text style={styles.playerLabel}>BATTER</Text>
            <Text style={styles.playerName}>
              {turnSetup.batter.firstName} {turnSetup.batter.lastName}
            </Text>
            <Text style={styles.playerPosition}>
              {getPositionAbbr(turnSetup.batter.position)}
            </Text>
          </View>
        </View>
      </View>

      {/* Stopwatch */}
      <View style={styles.stopwatchSection}>
        <Text style={styles.timerDisplay}>{displayTime}</Text>
        <TouchableOpacity
          style={[styles.timerButton, isTimerRunning && styles.timerButtonRunning]}
          onPress={handleTimerPress}
        >
          <Ionicons
            name={isTimerRunning ? 'stop' : 'play'}
            size={32}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.timerHint}>
          {isTimerRunning ? 'Select result & tap to stop' : 'Tap to start pitch'}
        </Text>
      </View>

      {/* Pitch Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PITCH TYPE</Text>
        <View style={styles.pitchTypesRow}>
          {PITCH_TYPES.map((type) => {
            const isSelected = selectedPitchType?.abbr === type.abbr;
            return (
              <TouchableOpacity
                key={type.abbr}
                style={[styles.pitchTypeButton, isSelected && styles.pitchTypeButtonSelected]}
                onPress={() => setSelectedPitchType(type)}
              >
                <Text style={[styles.pitchTypeButtonText, isSelected && styles.pitchTypeButtonTextSelected]}>
                  {type.abbr}
                </Text>
                <Text style={[styles.pitchTypeLabel, isSelected && styles.pitchTypeLabelSelected]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Select Result */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PITCH RESULT</Text>
        <View style={styles.resultsGrid}>
          {RESULTS.map((result) => {
            const isSelected = selectedResult === result;
            return (
              <TouchableOpacity
                key={result}
                style={[styles.resultButton, isSelected && styles.resultButtonSelected]}
                onPress={() => setSelectedResult(result)}
              >
                <Text style={[styles.resultText, isSelected && styles.resultTextSelected]}>
                  {result}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Recorded Pitches */}
      {pitches.length > 0 && (
        <View style={styles.pitchesSection}>
            <View style={styles.pitchesSectionTitleContainer}>
               <Text style={styles.sectionTitle}>RECORDED PITCHES ({pitches.length})</Text> 
               <Text style={styles.sectionTitle}>{balls} : {strikes}</Text>
            </View>
            
            <FlatList
            data={pitches}
            renderItem={renderPitch}
            keyExtractor={(item) => item.id}
            style={styles.pitchesList}
            nestedScrollEnabled={true}
            />
        </View>
      )}

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, pitches.length === 0 && styles.saveButtonDisabled]}
          onPress={handleSaveTurn}
          disabled={pitches.length === 0}
        >
          <Text style={[styles.saveButtonText, pitches.length === 0 && styles.saveButtonTextDisabled]}>
            Save Turn ({pitches.length} pitch{pitches.length !== 1 ? 'es' : ''})
          </Text>
        </TouchableOpacity>
      </View>

           {/* MPH Modal */}
      <Modal
        visible={showMphModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleMphSkip}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="speedometer-outline" size={32} color="#DC2626" />
              <Text style={styles.modalTitle}>Pitch Speed</Text>
              <Text style={styles.modalSubtitle}>Enter the ball speed (optional)</Text>
            </View>

            <View style={styles.mphInputContainer}>
              <TextInput
                style={styles.mphInput}
                placeholder="0"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                value={mphValue}
                onChangeText={setMphValue}
                maxLength={3}
                autoFocus={true}
              />
              <Text style={styles.mphLabel}>MPH</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.skipButton} onPress={handleMphSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleMphSubmit}>
                <Text style={styles.submitButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative'
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  playerPosition: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  // Stopwatch styles
  stopwatchSection: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: '#111827',
    marginBottom: 12,
  },
  timerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  timerButtonRunning: {
    backgroundColor: '#3B82F6',
  },
  timerHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  resultButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultButtonSelected: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  resultTextSelected: {
    color: '#fff',
  },
  // Recorded pitches
  pitchesSectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  pitchesSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: 250
  },
  pitchesList: {
    flex: 1,
  },
  pitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  pitchNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  pitchInfo: {
    flex: 1,
  },
  pitchResult: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8
  },
  pitchTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  pitchDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: 92,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  saveButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 18,
    width: '100%',
    height: 70,
    borderRadius: 100,
    left: '5%',
    justifyContent: 'center'
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
  // Pitch type style
  pitchTypesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pitchTypeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  pitchTypeButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pitchTypeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  pitchTypeButtonTextSelected: {
    color: '#fff',
  },
  pitchTypeLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  pitchTypeLabelSelected: {
    color: '#BFDBFE',
  },
pitchesListContent: {
  paddingBottom: 16,
},
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  mphInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  mphInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    minWidth: 120,
    borderBottomWidth: 3,
    borderBottomColor: '#DC2626',
    paddingBottom: 8,
  },
  mphLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  pitchTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pitchTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#3B82F6',
    padding: 3,
    marginLeft: 8,
    borderRadius: 5,
    paddingHorizontal: 8
  },
});