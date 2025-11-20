import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../components/CustomHeader';
import { COLORS, THEMESHADOW } from '../../theme/theme';
import Fonts from '../../theme/fonts';
import { moderateScale, verticalScale } from 'react-native-size-matters';

import {
  getCompletedPuja,
  getCompletedPujaDetails,
  getPastBookings,
} from '../../api/apiService';
import { translateData, translateText } from '../../utils/TranslateData';
import CustomeLoader from '../../components/CustomLoader';

const { width: screenWidth } = Dimensions.get('window');

const CompletePujaDetailsScreen = ({ navigation }: { navigation?: any }) => {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const currentLanguage = i18n.language;
  const { completed, booking_id } = (route.params || {}) as any;

  console.log('route params :: ', route.params);

  const [loading, setLoading] = useState<boolean>(false);
  const [completedPujaData, setCompletedPujaData] = useState<any>(null);
  const [pastBookingData, setPastBookingData] = useState<any>(null);

  const translationCacheRef = useRef(new Map());

  const fetchCompletedPuja = useCallback(async () => {
    setLoading(true);
    try {
      const cachedData = translationCacheRef.current.get(currentLanguage);
      if (cachedData) {
        setCompletedPujaData(cachedData);
        return;
      }

      const response: any = await getCompletedPujaDetails(booking_id);
      console.log('response :: ', response);

      const data = response?.data;

      const translatedData: any = await translateData(data, currentLanguage, [
        'pooja_title',
        'address',
        'booking_status',
        'muhurat_type',
        'payment_status',
        'user_name',
      ]);

      translationCacheRef.current.set(currentLanguage, translatedData);
      setCompletedPujaData(translatedData);
    } catch (error) {
      console.error('Error fetching completed puja:', error);
      setCompletedPujaData(undefined);
    } finally {
      setLoading(false);
    }
  }, [booking_id, currentLanguage]);

  const fetchPastBookingsData = useCallback(async () => {
    setLoading(true);
    try {
      const cachedData = translationCacheRef.current.get(currentLanguage);
      if (cachedData) {
        setPastBookingData(cachedData);
        return;
      }
      const response: any = await getPastBookings();
      const list = Array.isArray(response?.data) ? response.data : [];
      const selected =
        list.find(
          (item: any) =>
            item?.booking_id == booking_id || item?.id == booking_id,
        ) || list[0];

      const translatedData: any = await translateData(
        selected,
        currentLanguage,
        [
          'pooja_name',
          'booking_status',
          'muhurat_type',
          'booking_user_name',
          'payment_status',
          'samagri_required',
        ],
      );

      translatedData.assigned_pandit.name = await translateText(
        translatedData.assigned_pandit?.name,
        currentLanguage,
      );

      translationCacheRef.current.set(currentLanguage, translatedData);
      setPastBookingData(translatedData);
    } catch (error) {
      console.error('Error fetching past bookings:', error);
      setPastBookingData(undefined);
    } finally {
      setLoading(false);
    }
  }, [booking_id, currentLanguage]);

  useEffect(() => {
    if (completed) {
      fetchCompletedPuja();
    } else {
      fetchPastBookingsData();
    }
  }, [completed, booking_id, fetchCompletedPuja, fetchPastBookingsData]);

  const pujaData: any = completed ? completedPujaData : pastBookingData;

  const {
    pooja_name,
    pooja_image_url,
    booking_date,
    muhurat_time,
    muhurat_type,
    tirth_place_name,
    amount,
    booking_user_name,
    booking_user_img,
    booking_user_mobile,
    payment_status,
    notes,
    samagri_required,
    address_details,
    booking_status,
    assigned_pandit,
    pooja_image,
    pooja_price,
    pooja_title,
    user_name,
    user_profile_img,
    address,
  } = pujaData || {};

  // Helper to format date (e.g., 19th September)
  const formatDateWithOrdinal = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const s = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    const ordinal = s[(v - 20) % 10] || s[v] || s[0];
    return `${day}${ordinal} ${month}`;
  };

  // Helper for status color
  const getStatusColor = (status: string) => {
    if (!status) return COLORS.textSecondary;
    if (
      status.toLowerCase().includes('success') ||
      status.toLowerCase().includes('completed')
    ) {
      return COLORS.success || '#2ecc71';
    }
    if (status.toLowerCase().includes('pending')) {
      return COLORS.warning || '#f1c40f';
    }
    if (
      status.toLowerCase().includes('fail') ||
      status.toLowerCase().includes('cancel')
    ) {
      return COLORS.error || '#e74c3c';
    }
    return COLORS.textSecondary;
  };

  // Helper to get address string
  const getAddressString = (address: any) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address.full_address)
      return address.full_address;
    return '';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CustomeLoader loading={loading} />

      <CustomHeader
        title={completed ? t('completed_puja_details') : t('past_booking')}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.contentContainer}>
        {/* Show content only when not loading */}
        {!loading && pujaData ? (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Image
              source={{ uri: pooja_image_url || pooja_image }}
              style={[
                styles.heroImage,
                { width: screenWidth, height: verticalScale(200) },
              ]}
              resizeMode="stretch"
            />
            <View
              style={{
                flex: 1,
                paddingHorizontal: moderateScale(24),
                paddingTop: verticalScale(24),
              }}
            >
              <Text style={styles.pujaTitle}>
                {pooja_name || pooja_title || t('Puja Name')}
              </Text>
              <View style={[styles.card, THEMESHADOW.shadow]}>
                <View style={styles.cardInner}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('date')}</Text>
                    <Text style={styles.detailValue}>
                      {formatDateWithOrdinal(booking_date) || '-'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('amount')}</Text>
                    <Text
                      style={[styles.detailValue, { color: COLORS.success }]}
                    >
                      ₹{amount || pooja_price || '0'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('muhurat')}</Text>
                    <Text style={styles.detailValue}>
                      {muhurat_type && `(${muhurat_type})`}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('muhurat_time')}</Text>
                    <Text style={styles.detailValue}>
                      {muhurat_time || '-'}
                    </Text>
                  </View>
                  {tirth_place_name && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('temple')}</Text>
                      <Text style={styles.detailValue}>
                        {tirth_place_name || '-'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {t('samagri_required')}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color: samagri_required
                            ? COLORS.success
                            : COLORS.error,
                        },
                      ]}
                    >
                      {samagri_required ? t('Yes') : t('No')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {t('payment_status')}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: getStatusColor(payment_status) },
                      ]}
                    >
                      {payment_status
                        ? payment_status.charAt(0).toUpperCase() +
                          payment_status.slice(1)
                        : '-'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {t('booking_status')}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: getStatusColor(booking_status) },
                      ]}
                    >
                      {booking_status
                        ? booking_status.charAt(0).toUpperCase() +
                          booking_status.slice(1)
                        : '-'}
                    </Text>
                  </View>
                  {notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>{t('notes')}</Text>
                      <Text style={styles.notesValue}>{notes}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* User Card */}
              <View style={[styles.userCard, THEMESHADOW.shadow]}>
                <Image
                  source={{
                    uri:
                      booking_user_img ||
                      assigned_pandit?.profile_img_url ||
                      user_profile_img,
                  }}
                  style={styles.userImage}
                  resizeMode="cover"
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {assigned_pandit?.pandit_name ||
                      booking_user_name ||
                      user_name ||
                      t('User Name')}
                  </Text>
                </View>
              </View>

              {/* Address Card */}
              {address && (
                <View style={[styles.addressCard, THEMESHADOW.shadow]}>
                  <Text style={styles.addressLabel}>
                    {t('address_details')}
                  </Text>
                  <Text style={styles.addressValue}>{address}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : !loading ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: COLORS.error }}>{t('no_data')}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default CompletePujaDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.pujaBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    paddingBottom: verticalScale(32),
  },
  heroImage: {
    width: '100%',
    height: verticalScale(200),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    backgroundColor: COLORS.backGroundSecondary,
  },
  pujaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: verticalScale(20),
    paddingHorizontal: moderateScale(16),
    fontFamily: Fonts.Sen_Bold,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
  },
  cardInner: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontFamily: Fonts.Sen_Medium,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    fontFamily: Fonts.Sen_SemiBold,
  },
  notesContainer: {
    backgroundColor: COLORS.backGroundSecondary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  notesLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Fonts.Sen_Medium,
  },
  notesValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '400',
    fontFamily: Fonts.Sen_Regular,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    marginBottom: verticalScale(20),
    gap: 12,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.black,
    backgroundColor: COLORS.backGroundSecondary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: Fonts.Sen_SemiBold,
  },
  userMobile: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: Fonts.Sen_Regular,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
  },
  addressLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Fonts.Sen_Medium,
  },
  addressValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '400',
    fontFamily: Fonts.Sen_Regular,
  },
});
