import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/theme';

interface CurrentChoghadiyaProps {
  choghadiyaData: any[]; // Replace 'any' with proper type if available
}

const getChoghadiyaColor = (quality: string) => {
  switch (quality) {
    case 'Good':
      return COLORS.choghadiya.good;
    case 'Bad':
      return COLORS.choghadiya.bad;
    case 'Neutral':
      return COLORS.choghadiya.normal;
    case 'Normal':
      return COLORS.choghadiya.normal;
    default:
      return { bg: '#F5F5F5', text: '#616161' };
  }
};

const CurrentChoghadiyaCard: React.FC<CurrentChoghadiyaProps> = ({
  choghadiyaData,
}) => {
  const [currentChoghadiya, setCurrentChoghadiya] = useState<any>(null);
  const [nextChoghadiya, setNextChoghadiya] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!choghadiyaData || choghadiyaData.length === 0) {
      setCurrentChoghadiya(null);
      setNextChoghadiya(null);
      setTimeLeft('');
      return;
    }

    const allChoghadiya = choghadiyaData;

    const updateTimer = () => {
      const now = new Date();

      const parseTime = (timeStr: string, date: Date) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) {
          hours += 12;
        }
        if (modifier === 'AM' && hours === 12) {
          hours = 0;
        }

        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0);
        return newDate;
      };

      const currentIndex = allChoghadiya.findIndex(item => {
        // Handle time format "HH:mm AM/PM" or "HH:mm"
        let startTime, endTime;

        if (item.start.includes(' ') || item.end.includes(' ')) {
          startTime = parseTime(item.start, now);
          endTime = parseTime(item.end, now);
        } else {
          // Fallback for 24h format if simpler
          const [startH, startM] = item.start.split(':').map(Number);
          const [endH, endM] = item.end.split(':').map(Number);
          startTime = new Date(now);
          startTime.setHours(startH, startM, 0);
          endTime = new Date(now);
          endTime.setHours(endH, endM, 0);
        }

        // Handle night overlap (e.g. 11 PM to 1 AM)
        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }

        return now >= startTime && now < endTime;
      });

      if (currentIndex !== -1) {
        const current = allChoghadiya[currentIndex];
        setCurrentChoghadiya(current);

        // Find next choghadiya
        if (currentIndex < allChoghadiya.length - 1) {
          setNextChoghadiya(allChoghadiya[currentIndex + 1]);
        } else {
          setNextChoghadiya(null); // Or handle end of day logic if needed
        }

        let endTime;
        if (current.end.includes(' ')) {
          endTime = parseTime(current.end, now);
        } else {
          const [endH, endM] = current.end.split(':').map(Number);
          endTime = new Date(now);
          endTime.setHours(endH, endM, 0);
        }

        if (endTime < now) {
          endTime.setDate(endTime.getDate() + 1);
        }

        const diff = endTime.getTime() - now.getTime();
        if (diff > 0) {
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          setTimeLeft(
            `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
          );
        } else {
          setTimeLeft('00:00:00');
        }
      } else {
        setCurrentChoghadiya(null);
        setNextChoghadiya(null);
        setTimeLeft('');
      }
    };

    const timerId = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(timerId);
  }, [choghadiyaData]);

  if (!currentChoghadiya) return null;

  const currentColors = getChoghadiyaColor(currentChoghadiya.quality);
  const currentName = currentChoghadiya.type.replace(' Muhurat', '');

  const nextColors = nextChoghadiya
    ? getChoghadiyaColor(nextChoghadiya.quality)
    : null;
  const nextName = nextChoghadiya
    ? nextChoghadiya.type.replace(' Muhurat', '')
    : '';

  return (
    <View style={styles.container}>
      {/* Current Choghadiya Card */}
      <View style={[styles.card, { flex: 1 }]}>
        <View style={styles.cardHeader}>
          <Text
            style={styles.sectionLabel}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Current Choghadiya
          </Text>
        </View>

        <View style={styles.nameRow}>
          <Text style={[styles.nameText, { color: currentColors.text }]}>
            {currentName}
          </Text>
          <View style={[styles.badge, { backgroundColor: currentColors.bg }]}>
            <Text style={[styles.badgeText, { color: currentColors.text }]}>
              {currentChoghadiya.quality}
            </Text>
          </View>
        </View>

        <Text style={styles.timeRangeText}>
          {currentChoghadiya.start} - {currentChoghadiya.end}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.timeLabel}>Remaining</Text>
          <Text style={styles.timerText}>{timeLeft}</Text>
        </View>
      </View>

      {/* Next Choghadiya Card */}
      <View style={[styles.card, { flex: 1 }]}>
        {nextChoghadiya ? (
          <>
            <View style={styles.cardHeader}>
              <Text
                style={styles.sectionLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Next Choghadiya
              </Text>
            </View>

            <View style={styles.nameRow}>
              <Text style={[styles.nameText, { color: nextColors?.text }]}>
                {nextName}
              </Text>
              <View style={[styles.badge, { backgroundColor: nextColors?.bg }]}>
                <Text style={[styles.badgeText, { color: nextColors?.text }]}>
                  {nextChoghadiya.quality}
                </Text>
              </View>
            </View>

            <Text style={styles.timeRangeText}>
              {nextChoghadiya.start} - {nextChoghadiya.end}
            </Text>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Next Choghadiya</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
    minHeight: 150,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  cardHeader: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timeRangeText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 'auto',
    marginTop: 4,
  },
  footerRow: {
    marginTop: 16,
  },
  timeLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});

export default React.memo(CurrentChoghadiyaCard);
