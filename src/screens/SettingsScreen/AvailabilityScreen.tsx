import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS} from '../../theme/theme';
import Calendar from '../../components/Calendar';
import PrimaryButton from '../../components/PrimaryButton';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Fonts from '../../theme/fonts';
import {moderateScale} from 'react-native-size-matters';
import {
  postPanditAvailability,
  getPanditAvailability,
} from '../../api/apiService';
import {useCommonToast} from '../../common/CommonToast';

const AvailabilityScreen: React.FC = () => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // Track selected dates
  const [allFetchedDates, setAllFetchedDates] = useState<string[]>([]); // Track all dates fetched from API
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {showSuccessToast, showErrorToast} = useCommonToast();
  console.log(selectedDates);

  // Helper to ensure date is always in 'YYYY-MM-DD' format
  const formatDate = (date: string | Date | dayjs.Dayjs) => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  // Fetch availability dates on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      setFetching(true);
      try {
        const response: any = await getPanditAvailability();
        console.log('response================>', response.data);
        // The response is an array of objects: [{date: "YYYY-MM-DD", is_available: true}, ...]
        if (Array.isArray(response?.data)) {
          // Only select dates where is_available is true
          const formattedAvailable = response.data
            .filter((d: any) => d.is_available)
            .map((d: any) => formatDate(d.date));
          setSelectedDates(formattedAvailable);

          // Collect all dates present in the response
          const allDates = response.data.map((d: any) => formatDate(d.date));
          setAllFetchedDates(allDates);
        } else if (response?.data?.data?.available_dates) {
          // fallback for old structure
          const formattedAvailable = response.data.data.available_dates.map(
            (d: any) => formatDate(d),
          );
          setSelectedDates(formattedAvailable);

          // Try to get all possible dates (if available)
          if (Array.isArray(response.data.data.all_dates)) {
            setAllFetchedDates(
              response.data.data.all_dates.map((d: any) => formatDate(d)),
            );
          } else {
            // If not provided, fallback to available_dates only
            setAllFetchedDates(formattedAvailable);
          }
        }
      } catch (error) {
        showErrorToast(
          t('availability_fetch_failed') || 'Failed to fetch availability',
        );
      } finally {
        setFetching(false);
      }
    };
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentMonth = dayjs().add(monthOffset, 'month');
  const monthName = currentMonth.format('MMMM YYYY');
  const startDay = currentMonth.startOf('month').day();
  const daysInMonth = currentMonth.daysInMonth();

  const datesArray = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const paddedArray = [...Array(startDay).fill(null), ...datesArray];

  // If Calendar returns dates in other formats, ensure we convert to 'YYYY-MM-DD'
  const handleDateSelect = (dates: string[] | Date[] | dayjs.Dayjs[]) => {
    // Map all dates to 'YYYY-MM-DD' format
    const formattedDates = dates.map(date => formatDate(date));
    setSelectedDates(formattedDates);
  };

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

  const handleUpdateAvailability = async () => {
    setLoading(true);
    try {
      // Ensure all dates are in 'YYYY-MM-DD' format before sending
      const availableDatesFormatted = selectedDates.map(date =>
        formatDate(date),
      );

      // To get unavailable dates, use allFetchedDates minus selectedDates
      // If allFetchedDates is empty (first time), we can infer unavailable as empty
      let unavailableDatesFormatted: string[] = [];
      if (allFetchedDates.length > 0) {
        unavailableDatesFormatted = allFetchedDates.filter(
          d => !availableDatesFormatted.includes(d),
        );
      }

      const payload = {
        available_dates: availableDatesFormatted,
        unavailable_dates: unavailableDatesFormatted,
      };
      console.log('payload', payload);
      await postPanditAvailability(payload);
      showSuccessToast(t('availability_updated_successfully'));
    } catch (error) {
      showErrorToast(t('availability_update_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
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
            onDateSelect={handleDateSelect}
            selected={selectedDates}
          />

          {/* Update Availability Button */}
          <PrimaryButton
            title={t('update')}
            style={styles.updateButton}
            onPress={handleUpdateAvailability}
            disabled={loading || fetching}
          />
        </ScrollView>
      </View>
    </View>
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
