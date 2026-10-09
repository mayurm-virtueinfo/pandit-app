/**
 * PujaRequestModal.tsx
 *
 * Full-screen incoming Puja request modal (Rapido/Uber/Zomato-style).
 * Shows a rich booking card with a live countdown timer, pulsing animations,
 * and ACCEPT / DECLINE buttons.
 *
 * Lifecycle:
 *  - Listens for PUJA_REQUEST_INCOMING event from pujaRequestHandler
 *  - Displays full-screen modal with 30s countdown
 *  - Auto-declines when timer reaches 0
 *  - Cleans up sound, timer, and listeners on unmount
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  StatusBar,
  DeviceEventEmitter,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '../theme/theme';
import {
  PujaRequestData,
} from '../configuration/pujaRequest/pujaRequestNotification';
import {
  PUJA_REQUEST_EVENT,
  PUJA_REQUEST_DISMISS_EVENT,
  acceptPujaRequest,
  declinePujaRequest,
  autoDeclinePujaRequest,
} from '../configuration/pujaRequest/pujaRequestHandler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const PujaRequestModal: React.FC = () => {
  // State
  const [visible, setVisible] = useState(false);
  const [requestData, setRequestData] = useState<PujaRequestData | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const bellSwingAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ─────────────────────────────────────────────────────────
  // Animations
  // ─────────────────────────────────────────────────────────
  const startAnimations = useCallback(
    (durationSeconds: number) => {
      // Slide up entrance
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Pulsing timer circle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Bell swing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bellSwingAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bellSwingAnim, {
            toValue: -1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bellSwingAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ).start();

      // Progress bar countdown
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: durationSeconds * 1000,
        useNativeDriver: false,
      }).start();
    },
    [slideAnim, pulseAnim, progressAnim, bellSwingAnim, glowAnim],
  );

  const stopAnimations = useCallback(() => {
    pulseAnim.stopAnimation();
    slideAnim.stopAnimation();
    progressAnim.stopAnimation();
    bellSwingAnim.stopAnimation();
    glowAnim.stopAnimation();
    slideAnim.setValue(0);
    pulseAnim.setValue(1);
    progressAnim.setValue(1);
    bellSwingAnim.setValue(0);
    glowAnim.setValue(0);
  }, [pulseAnim, slideAnim, progressAnim, bellSwingAnim, glowAnim]);

  // ─────────────────────────────────────────────────────────
  // Countdown Timer
  // ─────────────────────────────────────────────────────────
  const startTimer = useCallback(
    (seconds: number, bookingId: string) => {
      setTimeLeft(seconds);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer expired — auto-decline
            clearTimer();
            autoDeclinePujaRequest(bookingId);
            return 0;
          }
          // Intensify vibration in last 5 seconds
          if (prev <= 6) {
            Vibration.vibrate(100);
          }
          return prev - 1;
        });
      }, 1000);
    },
    [],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    Vibration.cancel();
  }, []);

  // ─────────────────────────────────────────────────────────
  // Show Modal
  // ─────────────────────────────────────────────────────────
  const showModal = useCallback(
    (data: PujaRequestData) => {
      const seconds = parseInt(data.expireInSeconds, 10) || 30;

      setRequestData(data);
      setTimeLeft(seconds);
      setIsProcessing(false);
      setVisible(true);

      // Start animations & timer
      startAnimations(seconds);
      startTimer(seconds, data.bookingId);

      // Vibration pattern
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 500, 200, 500, 200, 500], true);
      }
    },
    [startAnimations, startTimer],
  );

  // ─────────────────────────────────────────────────────────
  // Hide Modal
  // ─────────────────────────────────────────────────────────
  const hideModal = useCallback(() => {
    clearTimer();
    stopAnimations();
    Vibration.cancel();
    setVisible(false);
    setRequestData(null);
    setIsProcessing(false);
  }, [clearTimer, stopAnimations]);

  // ─────────────────────────────────────────────────────────
  // Event Listeners
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const showSub = DeviceEventEmitter.addListener(
      PUJA_REQUEST_EVENT,
      (data: PujaRequestData) => {
        showModal(data);
      },
    );

    const dismissSub = DeviceEventEmitter.addListener(
      PUJA_REQUEST_DISMISS_EVENT,
      () => {
        hideModal();
      },
    );

    return () => {
      showSub.remove();
      dismissSub.remove();
      clearTimer();
      stopAnimations();
      Vibration.cancel();
    };
  }, [showModal, hideModal, clearTimer, stopAnimations]);

  // ─────────────────────────────────────────────────────────
  // Action Handlers
  // ─────────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!requestData || isProcessing) return;
    setIsProcessing(true);
    clearTimer();
    Vibration.cancel();

    const success = await acceptPujaRequest(requestData.bookingId);
    if (!success) {
      setIsProcessing(false);
      // Modal will be dismissed by the event emitter if API call succeeded
    }
    // hideModal is called via PUJA_REQUEST_DISMISS_EVENT from the handler
  };

  const handleDecline = async () => {
    if (!requestData || isProcessing) return;
    setIsProcessing(true);
    clearTimer();
    Vibration.cancel();

    await declinePujaRequest(requestData.bookingId);
    // hideModal is called via PUJA_REQUEST_DISMISS_EVENT from the handler
  };

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────
  const formatDakshina = (value: string): string => {
    const num = parseInt(value, 10);
    return isNaN(num) ? `₹${value}` : `₹${num.toLocaleString('en-IN')}`;
  };

  const formatPujaTime = (dateStr: string, dateLabel?: string): string => {
    try {
      const date = new Date(dateStr);
      const timeStr = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return dateLabel ? `${dateLabel} at ${timeStr}` : timeStr;
    } catch {
      return dateStr;
    }
  };

  // Don't render if not visible
  if (!visible || !requestData) {
    return null;
  }

  // ─────────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────────
  const isUrgent = timeLeft <= 10;
  const timerColor = isUrgent ? '#FF1744' : '#FFFFFF';

  const bellRotation = bellSwingAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: ['#FF1744', '#FF6D00', '#FFD600', '#00E676'],
  });

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      statusBarTranslucent
      onRequestClose={() => {
        // Block Android back button — must choose ACCEPT or DECLINE
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A1A2E"
        translucent
      />

      <View style={styles.container}>
        {/* ── Animated Glow Background ─── */}
        <Animated.View
          style={[
            styles.glowOverlay,
            { opacity: glowOpacity },
          ]}
        />

        {/* ── Header Section ─── */}
        <View style={styles.headerSection}>
          {/* Bell Icon */}
          <Animated.Text
            style={[
              styles.bellIcon,
              { transform: [{ rotate: bellRotation }] },
            ]}
          >
            🔔
          </Animated.Text>

          {/* NEW PUJA REQUEST Tag */}
          <View style={styles.tagContainer}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText}>NEW PUJA REQUEST</Text>
          </View>

          {/* Countdown Timer */}
          <Animated.View
            style={[
              styles.timerContainer,
              { transform: [{ scale: pulseAnim }] },
              isUrgent && styles.timerUrgent,
            ]}
          >
            <Text style={[styles.timerText, { color: timerColor }]}>
              {timeLeft}
            </Text>
            <Text style={[styles.timerLabel, { color: timerColor }]}>
              {timeLeft === 1 ? 'SECOND' : 'SECONDS'}
            </Text>
          </Animated.View>
        </View>

        {/* ── Progress Bar ─── */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth as any,
                backgroundColor: progressColor as any,
              },
            ]}
          />
        </View>

        {/* ── Booking Card ─── */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Puja Name */}
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>🪔</Text>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardLabel}>PUJA</Text>
              <Text style={styles.cardValue}>{requestData.pujaName}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Dakshina / Payout */}
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>💰</Text>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardLabel}>DAKSHINA</Text>
              <Text style={[styles.cardValue, styles.dakshinaValue]}>
                {formatDakshina(requestData.dakshina)}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Location & Distance */}
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>📍</Text>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardLabel}>LOCATION</Text>
              <Text style={styles.cardValue}>
                {requestData.location}
              </Text>
              <Text style={styles.cardSubValue}>
                {requestData.distance} km away
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Date & Time */}
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>📅</Text>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardLabel}>DATE & TIME</Text>
              <Text style={styles.cardValue}>
                {formatPujaTime(requestData.pujaTime, requestData.pujaDate)}
              </Text>
            </View>
          </View>

          {/* Customer Name (if available) */}
          {requestData.customerName && (
            <>
              <View style={styles.cardDivider} />
              <View style={styles.cardRow}>
                <Text style={styles.cardIcon}>👤</Text>
                <View style={styles.cardRowContent}>
                  <Text style={styles.cardLabel}>CUSTOMER</Text>
                  <Text style={styles.cardValue}>
                    {requestData.customerName}
                  </Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>

        {/* ── Action Buttons ─── */}
        <View style={styles.actionContainer}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={COLORS.white} />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <>
              {/* DECLINE Button */}
              <TouchableOpacity
                style={styles.declineButton}
                onPress={handleDecline}
                activeOpacity={0.7}
              >
                <Text style={styles.declineIcon}>✕</Text>
                <Text style={styles.declineText}>DECLINE</Text>
              </TouchableOpacity>

              {/* ACCEPT Button */}
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAccept}
                activeOpacity={0.7}
              >
                <Text style={styles.acceptIcon}>✓</Text>
                <Text style={styles.acceptText}>ACCEPT PUJA</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Auto-Decline Warning ─── */}
        {isUrgent && (
          <Text style={styles.urgentWarning}>
            ⚠️ Auto-declining in {timeLeft}s if no action taken
          </Text>
        )}
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    paddingTop: Platform.OS === 'ios' ? moderateScale(60) : moderateScale(40),
    paddingHorizontal: moderateScale(20),
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? moderateScale(40) : moderateScale(24),
  },
  glowOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#F21825',
    opacity: 0.05,
  },

  // ── Header ──
  headerSection: {
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  bellIcon: {
    fontSize: moderateScale(40),
    marginBottom: moderateScale(8),
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 24, 37, 0.15)',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(242, 24, 37, 0.4)',
    marginBottom: moderateScale(16),
  },
  tagDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#FF1744',
    marginRight: moderateScale(8),
  },
  tagText: {
    color: '#FF6B6B',
    fontSize: moderateScale(13),
    fontWeight: '800',
    letterSpacing: 2,
  },

  // ── Timer ──
  timerContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timerUrgent: {
    borderColor: '#FF1744',
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
  },
  timerText: {
    fontSize: moderateScale(36),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  timerLabel: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginTop: moderateScale(-2),
  },

  // ── Progress Bar ──
  progressBarContainer: {
    height: moderateScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(2),
    overflow: 'hidden',
    marginBottom: moderateScale(16),
  },
  progressBar: {
    height: '100%',
    borderRadius: moderateScale(2),
  },

  // ── Card ──
  card: {
    backgroundColor: '#16213E',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    // Shadow
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: moderateScale(10),
  },
  cardIcon: {
    fontSize: moderateScale(22),
    marginRight: moderateScale(14),
    marginTop: moderateScale(2),
  },
  cardRowContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.5,
    marginBottom: moderateScale(4),
  },
  cardValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: moderateScale(22),
  },
  cardSubValue: {
    fontSize: moderateScale(13),
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: moderateScale(2),
  },
  dakshinaValue: {
    fontSize: moderateScale(22),
    fontWeight: '900',
    color: '#00E676',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  // ── Actions ──
  actionContainer: {
    flexDirection: 'row',
    gap: moderateScale(12),
    marginTop: moderateScale(16),
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(14),
    elevation: 4,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  declineIcon: {
    fontSize: moderateScale(18),
    color: '#FFFFFF',
    fontWeight: '900',
    marginRight: moderateScale(6),
  },
  declineText: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  acceptButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C853',
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(14),
    elevation: 4,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  acceptIcon: {
    fontSize: moderateScale(20),
    color: '#FFFFFF',
    fontWeight: '900',
    marginRight: moderateScale(6),
  },
  acceptText: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // ── Processing State ──
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(16),
  },
  processingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(14),
    marginTop: moderateScale(8),
  },

  // ── Urgent Warning ──
  urgentWarning: {
    textAlign: 'center',
    color: '#FF6B6B',
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginTop: moderateScale(12),
  },
});

export default PujaRequestModal;
