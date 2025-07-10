import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS} from '../../theme/theme';
import Calendar from '../../components/Calendar';
import PrimaryButton from '../../components/PrimaryButton';
import {SafeAreaView} from 'react-native-safe-area-context';
import Fonts from '../../theme/fonts';
import {moderateScale} from 'react-native-size-matters';

const AvailabilityScreen: React.FC = () => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // Track selected dates

  const {t} = useTranslation();

  const currentMonth = dayjs().add(monthOffset, 'month');
  const monthName = currentMonth.format('MMMM YYYY');
  const startDay = currentMonth.startOf('month').day();
  const daysInMonth = currentMonth.daysInMonth();

  const datesArray = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const paddedArray = [...Array(startDay).fill(null), ...datesArray];

  const toggleDate = (day: number | null) => {
    if (!day) return;
    const dateStr = currentMonth.date(day).format('YYYY-MM-DD');
    setSelectedDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr],
    );
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setMonthOffset(prev => (direction === 'prev' ? prev - 1 : prev + 1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <UserCustomHeader
        showBackButton
        showMenuButton={false}
        title={t('availability')}
      />

      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.description}>{t('availability_desc')}</Text>

          {/* Calendar Component */}
          <Calendar
            month={monthName}
            onMonthChange={handleMonthChange}
            onDateSelect={setSelectedDates}
            selected={selectedDates}
          />

          {/* Update Availability Button */}
          <PrimaryButton
            title={t('update')}
            style={styles.updateButton}
            onPress={() => {
              // TODO: handle update availability logic
            }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AvailabilityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.pujaBackground,
    paddingVertical: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  description: {
    fontSize: moderateScale(14),
    color: COLORS.darkText,
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: Fonts.Sen_Regular,
  },
  scrollContent: {flex: 1, paddingHorizontal: 24},
  updateButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
});
