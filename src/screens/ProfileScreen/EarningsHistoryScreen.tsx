import React, {useEffect, useState, useMemo} from 'react';
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
import {getWallet, getTransactions} from '../../api/apiService';
import {useTranslation} from 'react-i18next';
import Options from '../../components/Options';

interface TransactionItem {
  id: number;
  title: string;
  date: string;
  amount: string;
  rawDate: string;
  rawAmount?: number;
}

const EarningsHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [walletAmount, setWalletAmount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch wallet
        const walletRes: any = await getWallet();
        let walletValue = 0;
        if (
          walletRes &&
          typeof walletRes === 'object' &&
          walletRes.data &&
          walletRes.data.data &&
          walletRes.data.data.balance !== undefined
        ) {
          walletValue = Number(walletRes.data.data.balance) || 0;
        }
        setWalletAmount(walletValue);

        // Fetch transactions
        const txRes: any = await getTransactions();
        let txItems: any[] = [];
        if (Array.isArray(txRes)) {
          txItems = txRes;
        } else if (
          txRes &&
          typeof txRes === 'object' &&
          txRes.data &&
          Array.isArray(txRes.data.data)
        ) {
          txItems = txRes.data.data;
        }
        // Map API data to local display format
        const mapped: TransactionItem[] = txItems.map(item => {
          const rawAmount = Number(item.amount || item.price || 0);
          return {
            id: item.id,
            title: item.title || item.description || t('transaction'),
            date: item.date,
            amount: `₹ ${rawAmount.toLocaleString()}`,
            rawDate: item.date,
            rawAmount: rawAmount,
          };
        });
        setTransactions(mapped);
      } catch (error) {
        setWalletAmount(0);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatDate(dateString: string) {
    if (!dateString) return '';
    if (/^\d{1,2} [A-Za-z]+ \d{4}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', {month: 'long'});
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      if (!selectedMonth && !selectedYear) return true;
      if (!item.rawDate || typeof item.rawDate !== 'string') return false;
      const parts = item.rawDate.split(' ');
      if (parts.length !== 3) return false;
      const [, month, year] = parts;
      const monthMatch = selectedMonth ? month === selectedMonth : true;
      const yearMatch = selectedYear ? year === selectedYear : true;
      return monthMatch && yearMatch;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Calculate total earnings for filtered transactions if filter is applied
  const totalFilteredEarnings = useMemo(() => {
    if (!selectedMonth && !selectedYear) return walletAmount;
    return filteredTransactions.reduce(
      (sum, item) => sum + (item.rawAmount || 0),
      0,
    );
  }, [filteredTransactions, selectedMonth, selectedYear, walletAmount]);

  const renderTransactionItem = (item: TransactionItem, index: number) => (
    <>
      <View style={styles.earningsItem}>
        <View style={styles.earningsItemLeft}>
          <Text style={styles.earningsTitle}>{item.title}</Text>
          <Text style={styles.earningsDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.earningsAmount}>{item.amount}</Text>
      </View>
      {index < filteredTransactions.length - 1 && (
        <View style={styles.separator} />
      )}
    </>
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
              ₹ {totalFilteredEarnings.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
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
            ) : filteredTransactions.length === 0 ? (
              <View style={{alignItems: 'center', padding: 20}}>
                <Text
                  style={{color: COLORS.gray, fontFamily: Fonts.Sen_Medium}}>
                  {t('no_earnings_history_available')}
                </Text>
              </View>
            ) : (
              filteredTransactions.map((item, index) => (
                <View key={item.id}>{renderTransactionItem(item, index)}</View>
              ))
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
    paddingBottom: verticalScale(100),
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
