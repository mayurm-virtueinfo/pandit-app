import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {apiService, EarningsHistoryResponse} from '../../api/apiService';
import {useTranslation} from 'react-i18next';
import Options from '../../components/Options';

interface EarningHistoryItem {
  id: number;
  title: string;
  date: string; // "5 January 2025"
  amount: string;
  rawDate: string; // keep original for filtering
}

const EarningsHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  const [earningsData, setEarningsData] = useState<EarningHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  // console.log('earningsData', earningsData);

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        // Fetch data from API
        const data = await apiService.getEaningsHistoryData();
        let items: EarningsHistoryResponse[] = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && typeof data === 'object' && data.id !== 0) {
          items = [data];
        }
        // Map API data to local display format
        const mapped: EarningHistoryItem[] = items.map(item => ({
          id: item.id,
          title: item.poojaName,
          date: item.date, // keep as "5 January 2025"
          amount: `₹ ${item.price.toLocaleString()}`,
          rawDate: item.date, // for filtering
        }));
        setEarningsData(mapped);
      } catch (error) {
        setEarningsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  // Helper to format date as "6 September 2024" (if needed for display)
  function formatDate(dateString: string) {
    if (!dateString) return '';
    // If already in "5 January 2025" format, just return
    if (/^\d{1,2} [A-Za-z]+ \d{4}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', {month: 'long'});
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // Filtering logic for "5 January 2025" format
  const filteredEarnings = earningsData.filter(item => {
    if (!selectedMonth && !selectedYear) return true;
    // Defensive: ensure item.rawDate is a string and not undefined/null
    if (!item.rawDate || typeof item.rawDate !== 'string') return false;
    // item.rawDate is "5 January 2025"
    // Split into [day, month, year]
    const parts = item.rawDate.split(' ');
    if (parts.length !== 3) return false;
    const [day, month, year] = parts;
    const monthMatch = selectedMonth ? month === selectedMonth : true;
    const yearMatch = selectedYear ? year === selectedYear : true;
    return monthMatch && yearMatch;
  });

  // Calculate total earnings AFTER filter
  const totalEarnings = filteredEarnings.reduce(
    (sum, item) => sum + parseInt(item.amount.replace(/[^\d]/g, ''), 10),
    0,
  );

  const renderEarningsItem = (item: EarningHistoryItem, index: number) => (
    <View key={item.id}>
      <View style={styles.earningsItem}>
        <View style={styles.earningsItemLeft}>
          <Text style={styles.earningsTitle}>{item.title}</Text>
          <Text style={styles.earningsDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.earningsAmount}>{item.amount}</Text>
      </View>
      {index < filteredEarnings.length - 1 && <View style={styles.separator} />}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <UserCustomHeader
        title={t('earnings_history')}
        showBackButton={true}
        showSliderButton={true}
        onFilterPress={() => setFilter(true)}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Total Earnings Card */}
        <View style={[styles.totalEarningsCard, THEMESHADOW.shadow]}>
          <View style={styles.totalEarningsContent}>
            <Text style={styles.totalEarningsLabel}>{t('total_earnings')}</Text>
            <Text style={styles.totalEarningsAmount}>
              ₹ {totalEarnings.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          {/* Show selected filter if applied */}
          {selectedMonth || selectedYear ? (
            <Text style={styles.historyTitle}>
              {selectedMonth && selectedYear
                ? `${selectedMonth} ${selectedYear}`
                : selectedMonth
                ? selectedMonth
                : selectedYear
                ? selectedYear
                : ''}
            </Text>
          ) : (
            <Text style={styles.historyTitle}>{t('history')}</Text>
          )}

          <View style={[styles.historyCard, THEMESHADOW.shadow]}>
            {loading ? (
              <View style={{alignItems: 'center', padding: 20}}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : filteredEarnings.length === 0 ? (
              <View style={{alignItems: 'center', padding: 20}}>
                <Text
                  style={{color: COLORS.gray, fontFamily: Fonts.Sen_Medium}}>
                  {t('no_earnings_history_available')}
                </Text>
              </View>
            ) : (
              filteredEarnings.map((item, index) =>
                renderEarningsItem(item, index),
              )
            )}
          </View>
        </View>
      </ScrollView>

      <Options
        visible={filter}
        onClose={() => setFilter(false)}
        onApply={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
          setFilter(false);
        }}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(100), // Extra padding for bottom navigation
  },
  totalEarningsCard: {
    backgroundColor: COLORS.white,
    marginBottom: verticalScale(24),
  },
  totalEarningsContent: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalEarningsLabel: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    letterSpacing: -0.33,
  },
  totalEarningsAmount: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
  },
  historySection: {
    flex: 1,
  },
  historyTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(12),
  },
  historyCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(17),
  },
  earningsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(2),
  },
  earningsItemLeft: {
    flex: 1,
    marginRight: scale(20),
  },
  earningsTitle: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    letterSpacing: -0.33,
    marginBottom: verticalScale(4),
  },
  earningsDate: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.gray,
  },
  earningsAmount: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    letterSpacing: -0.33,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginVertical: verticalScale(13),
  },
});
export default EarningsHistoryScreen;
