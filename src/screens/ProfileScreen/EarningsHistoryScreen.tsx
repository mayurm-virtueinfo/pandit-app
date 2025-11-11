import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  useColorScheme,
  Modal,
} from 'react-native';
import UserCustomHeader from '../../components/CustomHeader';
import { COLORS, THEMESHADOW } from '../../theme/theme';
import Fonts from '../../theme/fonts';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getWallet,
  getTransactions,
  postWithDrawalRequest,
} from '../../api/apiService';
import { useTranslation } from 'react-i18next';
import Options from '../../components/Options';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { translateText } from '../../utils/TranslateData';
import { formatReasonText } from '../../helper/helper';
import PrimaryButton from '../../components/PrimaryButton';
import PrimaryButtonOutlined from '../../components/PrimaryButtonOutlined';
import CustomTextInput from '../../components/CustomTextInput';
import { useCommonToast } from '../../common/CommonToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../../utils/AppContent';

interface TransactionItem {
  id: number;
  title: string;
  date: string;
  amount: string;
  rawDate: string;
  rawAmount?: number;
  transactionType?: string;
  chargedAmount?: number;
  amountToCredit?: number;
  amountToDebit?: number;
  booking?: number;
  notes?: string | null;
  reason?: string;
  paymentModeLabel?: string;
}

const EarningsHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const inset = useSafeAreaInsets();
  const { showErrorToast, showSuccessToast } = useCommonToast();

  useEffect(() => {
    fetchData();
  }, [i18n.language]);

  const fetchData = async () => {
    setLoading(true);
    try {
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

      // ✅ Map & translate
      const mapped: TransactionItem[] = await Promise.all(
        txItems.map(async (item, idx) => {
          let rawAmount = 0;
          if (item.transaction_type === 'credit')
            rawAmount = Number(item.amount_to_credit || 0);
          else if (item.transaction_type === 'debit')
            rawAmount = Number(item.amount_to_debit || 0);
          else rawAmount = Number(item.amount || 0);

          const translatedTitle = await translateText(
            item.puja_name || t('transaction'),
            i18n.language,
          );
          const rawReason = item.reason ? formatReasonText(item.reason) : '';
          const translatedReason = rawReason
            ? await translateText(rawReason, i18n.language)
            : '';

          const rawNotes = item.notes ? formatReasonText(item.notes) : '';
          console.log('rawNotes :: ', rawNotes);

          const translatedNotes = rawNotes
            ? await translateText(rawNotes, i18n.language)
            : '';

          let paymentModeLabel: string | undefined;
          if (typeof item.is_cos === 'boolean') {
            paymentModeLabel = item.is_cos ? t('cash_on') : t('online');
          }

          return {
            id: item.id ?? idx,
            title: translatedTitle,
            date: item.timestamp,
            amount: `₹ ${rawAmount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            rawDate: item.timestamp,
            rawAmount,
            transactionType: item.transaction_type,
            chargedAmount: item.charged_amount
              ? Number(item.charged_amount)
              : undefined,
            amountToCredit: item.amount_to_credit
              ? Number(item.amount_to_credit)
              : undefined,
            amountToDebit: item.amount_to_debit
              ? Number(item.amount_to_debit)
              : undefined,
            booking: item.booking,
            notes: translatedNotes,
            reason: translatedReason,
            paymentModeLabel,
          };
        }),
      );

      setTransactions(mapped);
    } catch (error) {
      setWalletAmount(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const handleWithdraw = () => {
    setWithdrawModalVisible(true);
  };

  const handleSubmitWithdraw = async () => {
    try {
      if (!withdrawAmount) {
        showErrorToast(t('please_enter_amount'));
        return;
      }

      setWithdrawLoading(true);

      const userId = await AsyncStorage.getItem(AppConstant.USER_ID);
      const data: any = {
        pandit_id: Number(userId),
        amount: withdrawAmount,
      };

      const response: any = await postWithDrawalRequest(data);

      if (response?.success) {
        console.log('withdraw response :: ', response);
        showErrorToast(response?.message || t('withdrawal_request_success'));
        setWithdrawAmount('');
        setWithdrawModalVisible(false);
        // fetchData();
      }
    } catch (error: any) {
      console.error('withdraw error :: ', error?.data?.message || error);
      showErrorToast(error?.data?.message || t('withdrawal_request_failed'));
    } finally {
      setWithdrawLoading(false);
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      if (!selectedMonth && !selectedYear) return true;
      if (!item.rawDate || typeof item.rawDate !== 'string') return false;
      const date = new Date(item.rawDate);
      if (isNaN(date.getTime())) return false;
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const year = String(date.getFullYear());
      const monthMatch = selectedMonth ? month === selectedMonth : true;
      const yearMatch = selectedYear ? year === selectedYear : true;
      return monthMatch && yearMatch;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalFilteredEarnings = useMemo(() => {
    if (!selectedMonth && !selectedYear) return walletAmount;
    return filteredTransactions.reduce((sum, item) => {
      if (item.transactionType === 'debit') {
        return sum - (item.rawAmount || 0);
      }
      return sum + (item.rawAmount || 0);
    }, 0);
  }, [filteredTransactions, selectedMonth, selectedYear, walletAmount]);

  const renderTransactionItem = (item: TransactionItem, index: number) => (
    <>
      <View style={styles.earningsItem}>
        <View style={styles.earningsItemLeft}>
          <View style={styles.titleRow}>
            <Icon
              name={
                item.transactionType === 'debit'
                  ? 'arrow-downward'
                  : 'arrow-upward'
              }
              size={moderateScale(20)}
              color={
                item.transactionType === 'debit' ? COLORS.error : COLORS.success
              }
            />
            <Text style={styles.earningsTitle}>{item.title}</Text>
          </View>
          <Text style={styles.earningsDate}>{formatDate(item.date)}</Text>
          {item.reason && (
            <Text style={styles.earningsReason}>{item.reason}</Text>
          )}
          {item.chargedAmount && item.chargedAmount > 0 && (
            <Text style={styles.earningsCharged}>
              {t('charged_amount')}: ₹{' '}
              {item.chargedAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          )}
          {item.paymentModeLabel && (
            <View style={styles.payment_method}>
              <Text
                style={[
                  styles.paymentMethodText,
                  {
                    color: isDarkMode
                      ? COLORS.primaryTextDark
                      : COLORS.primaryTextDark,
                  },
                ]}
              >
                {t('payment_method')}
              </Text>
              <Text style={styles.cash}>{item.paymentModeLabel}</Text>
            </View>
          )}
          {/* {item.notes && <Text style={styles.earningsNotes}>{item.notes}</Text>} */}
        </View>
        <Text
          style={[
            styles.earningsAmount,
            {
              color:
                item.transactionType === 'debit'
                  ? COLORS.error
                  : COLORS.success,
            },
          ]}
        >
          {item.transactionType === 'debit' ? '-' : '+'}
          {item.amount}
        </Text>
      </View>
      {index < filteredTransactions.length - 1 && (
        <View style={styles.separator} />
      )}
    </>
  );

  return (
    <>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
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
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.totalEarningsCard, THEMESHADOW.shadow]}>
            <View style={styles.totalEarningsContent}>
              <Text style={styles.totalEarningsLabel}>
                {t('total_earnings')}
              </Text>
              <Text style={styles.totalEarningsAmount}>
                ₹{' '}
                {totalFilteredEarnings.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>{t('history')}</Text>
            <View style={[styles.historyCard, THEMESHADOW.shadow]}>
              {loading ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : filteredTransactions.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text
                    style={{ color: COLORS.gray, fontFamily: Fonts.Sen_Medium }}
                  >
                    {t('no_earnings_history_available')}
                  </Text>
                </View>
              ) : (
                filteredTransactions.map((item, index) => (
                  <View key={item.id}>
                    {renderTransactionItem(item, index)}
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
        <View
          style={[
            styles.buttonFixedContainer,
            { paddingBottom: inset.bottom || 16 },
          ]}
        >
          <PrimaryButton
            title={t('withdraw')}
            onPress={handleWithdraw}
            style={styles.buttonContainer}
            textStyle={styles.buttonText}
          />
        </View>

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
      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('request_withdrawal')}</Text>

            <Text style={styles.modalLabel}>
              {t('total_earnings')}: ₹{' '}
              {walletAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>

            <CustomTextInput
              placeholder={t('enter_amount')}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              style={styles.input}
              label=""
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtonRow}>
              <PrimaryButton
                title={t('submit')}
                onPress={handleSubmitWithdraw}
                style={styles.modalButton}
                loading={withdrawLoading}
              />
              <PrimaryButtonOutlined
                title={t('cancel')}
                onPress={() => setWithdrawModalVisible(false)}
                style={styles.modalButton}
                disabled={withdrawLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBackground },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(24),
  },
  totalEarningsCard: {
    backgroundColor: COLORS.white,
    marginBottom: verticalScale(24),
    borderRadius: moderateScale(10),
  },
  totalEarningsContent: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalEarningsLabel: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
  },
  totalEarningsAmount: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.success,
  },
  historySection: { flex: 1 },
  historyTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(12),
  },
  historyCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(10),
  },
  earningsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(8),
  },
  earningsItemLeft: { flex: 1, marginRight: scale(16) },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  earningsTitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    marginLeft: scale(8),
  },
  earningsDate: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.gray,
    marginBottom: verticalScale(4),
  },
  earningsReason: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.gray,
    marginBottom: verticalScale(2),
  },
  earningsCharged: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.error,
    marginBottom: verticalScale(2),
  },
  earningsNotes: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.gray,
  },
  payment_method: { flexDirection: 'row', alignItems: 'center' },
  paymentMethodText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_SemiBold,
    marginRight: 4,
  },
  cash: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
  },
  earningsAmount: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_SemiBold,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginVertical: verticalScale(12),
  },
  buttonContainer: {
    height: 46,
    marginHorizontal: moderateScale(24),
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
  },
  buttonFixedContainer: {
    backgroundColor: COLORS.white,
    paddingTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.gray,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
    marginBottom: 8,
    marginTop: 8,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  modalButton: { flex: 1, height: 46 },
});

export default EarningsHistoryScreen;
