import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
// import { COLORS } from '../constants/colors';
import CustomHeader from '../components/CustomHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import { COLORS } from '../theme/theme';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const AvailabilityScreen : React.FC = () => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [nonAvailableDays, setNonAvailableDays] = useState<number[]>([15, 16, 17, 23, 24]);

  const currentMonth = dayjs().add(monthOffset, 'month');
  const monthName = currentMonth.format('MMMM YYYY');
  const startDay = currentMonth.startOf('month').day();
  const daysInMonth = currentMonth.daysInMonth();

  const datesArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddedArray = [
    ...Array(startDay).fill(null),
    ...datesArray,
  ];

  const toggleDate = (day: number | null) => {
    if (!day) return;
    if (nonAvailableDays.includes(day)) {
      setNonAvailableDays(nonAvailableDays.filter(d => d !== day));
    } else {
      setNonAvailableDays([...nonAvailableDays, day]);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton
        showMenuButton={false}
        title="Availability"
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.description}>
          Set your availability for upcoming months so, it would help system to provide better user
          experience while catering the pooja booking of end user. Mark the days when you aren't
          available. The Non-Available are marked with red color.
        </Text>

        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => setMonthOffset(monthOffset - 2)}>
            <Icon name="keyboard-double-arrow-left" size={20} color={COLORS.darkText} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMonthOffset(monthOffset - 1)}>
            <Icon name="chevron-left" size={28} color={COLORS.darkText} />
          </TouchableOpacity>

          <Text style={styles.monthText}>{monthName}</Text>

          <TouchableOpacity onPress={() => setMonthOffset(monthOffset + 1)}>
            <Icon name="chevron-right" size={28} color={COLORS.darkText} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMonthOffset(monthOffset + 2)}>
            <Icon name="keyboard-double-arrow-right" size={20} color={COLORS.darkText} />
          </TouchableOpacity>
        </View>

        {/* Weekday Labels */}
        <View style={styles.daysRow}>
          {DAYS.map((day, index) => (
            <Text key={index} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {paddedArray.map((day, index) => {
            const isDisabled = !day;
            const isRed = day && nonAvailableDays.includes(day);
            return (
              <TouchableOpacity
                key={index}
                style={styles.dateCell}
                onPress={() => toggleDate(day)}
                disabled={isDisabled}
              >
                <Text style={[
                  styles.dateText,
                  isDisabled && styles.disabledText,
                  isRed && styles.redText
                ]}>
                  {day ?? ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Update Availability Button */}
        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Update Availability</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AvailabilityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  description: {
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 16,
    lineHeight: 22,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textGray,
    fontSize: 13,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 20,
  },
  dateCell: {
    width: `${100 / 7}%`,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: COLORS.darkText,
  },
  redText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  disabledText: {
    color: COLORS.lightGray,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
