import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import Speaker from './src/engine/Speaker';
import { parseCommand } from './src/engine/CommandParser';
import { dispatch } from './src/engine/ActionDispatcher';
import { usePermissions } from './src/hooks/usePermissions';

// All the states Nova can be in
type NovaState = 'idle' | 'listening' | 'processing';

// A single entry in the command history log
type LogEntry = {
  id: number;
  heard: string;
  command: string;
  time: string;
};

export default function App() {
  const { granted, loading } = usePermissions();
  const [novaState, setNovaState] = useState<NovaState>('idle');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [statusText, setStatusText] = useState('Initializing...');
  const entryId = useRef(0);

  // Animation value for the mic button pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!granted) return;
    initializeNova();
  }, [granted]);

  // Pulse animation — runs when Nova is listening
  useEffect(() => {
    if (novaState === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [novaState]);

  async function initializeNova() {
    setStatusText('Starting up...');
    await Speaker.initialize();
    setStatusText('Tap the mic and speak');
    Speaker.speak('Nova is ready');
  }

  // Called when user taps a command chip to test it
  async function handleTestCommand(text: string) {
    setNovaState('processing');
    setStatusText(`Processing: "${text}"`);

    const command = parseCommand(text);
    addToLog(text, command.type);
    await dispatch(command);

    setNovaState('idle');
    setStatusText('Tap the mic and speak');
  }

  function addToLog(heard: string, commandType: string) {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry: LogEntry = {
      id: entryId.current++,
      heard,
      command: commandType,
      time,
    };
    // Add to top of list, keep only last 10
    setLogEntries(prev => [newEntry, ...prev].slice(0, 10));
  }

  // Mic button color changes based on state
  const micColor =
    novaState === 'listening' ? '#FF4757' :
    novaState === 'processing' ? '#FFA502' :
    '#6C63FF';

  const micLabel =
    novaState === 'listening' ? 'Listening...' :
    novaState === 'processing' ? 'Processing...' :
    'Tap to speak';

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.whiteText}>Setting up Nova...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={[
          styles.statusDot,
          { backgroundColor: granted ? '#2ED573' : '#FF4757' }
        ]} />
        <Text style={styles.title}>NOVA</Text>
        <Text style={styles.subtitle}>OFFLINE AI ASSISTANT</Text>
      </View>

      {/* ── Status text ── */}
      <Text style={styles.statusText}>{statusText}</Text>

      {/* ── Mic button ── */}
      <View style={styles.micSection}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.micButton, { backgroundColor: micColor }]}
            activeOpacity={0.8}
            onPress={() => {
              // For now — toggle listening state
              // Vosk will be wired in next
              if (novaState === 'idle') {
                setNovaState('listening');
                setStatusText('Listening...');
                Speaker.speak('Listening');
              } else {
                setNovaState('idle');
                setStatusText('Tap the mic and speak');
              }
            }}
          >
            <Text style={styles.micIcon}>
              {novaState === 'listening' ? '⏹' :
               novaState === 'processing' ? '⏳' : '🎤'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.micLabel}>{micLabel}</Text>
      </View>

      {/* ── Command chips — tap to test ── */}
      <View style={styles.chipsSection}>
        <Text style={styles.chipsTitle}>TAP TO TEST A COMMAND</Text>
        <View style={styles.chipsGrid}>
          {[
            'What time is it',
            'What day is today',
            'How is my battery',
            'Set timer for 1 minute',
            'Open camera',
            'Play music',
          ].map(cmd => (
            <TouchableOpacity
              key={cmd}
              style={styles.chip}
              onPress={() => handleTestCommand(cmd)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>"{cmd}"</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Command history log ── */}
      {logEntries.length > 0 && (
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>RECENT COMMANDS</Text>
          <ScrollView style={styles.logScroll}>
            {logEntries.map(entry => (
              <View key={entry.id} style={styles.logRow}>
                <Text style={styles.logTime}>{entry.time}</Text>
                <View style={styles.logContent}>
                  <Text style={styles.logHeard}>"{entry.heard}"</Text>
                  <Text style={styles.logCommand}>→ {entry.command}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A14',
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A14',
  },
  whiteText: { color: '#FFFFFF', fontSize: 18 },

  // Header
  header: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 10 },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 10,
  },
  subtitle: {
    fontSize: 11,
    color: '#6C63FF',
    letterSpacing: 3,
    marginTop: 4,
  },

  // Status
  statusText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },

  // Mic button
  micSection: { alignItems: 'center', marginBottom: 36 },
  micButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
  },
  micIcon: { fontSize: 38 },
  micLabel: {
    color: '#555555',
    fontSize: 13,
    marginTop: 12,
    letterSpacing: 1,
  },

  // Command chips
  chipsSection: { marginBottom: 24 },
  chipsTitle: {
    color: '#444444',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#13132A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1E1E3A',
  },
  chipText: { color: '#8888AA', fontSize: 12 },

  // Log
  logSection: {
    backgroundColor: '#0D0D20',
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  logTitle: {
    color: '#444444',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  logScroll: { flex: 1 },
  logRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  logTime: { color: '#444444', fontSize: 11, marginTop: 2, width: 40 },
  logContent: { flex: 1 },
  logHeard: { color: '#CCCCCC', fontSize: 13 },
  logCommand: { color: '#6C63FF', fontSize: 11, marginTop: 3 },
});