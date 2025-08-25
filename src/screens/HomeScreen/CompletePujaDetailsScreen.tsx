import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import CustomHeader from '../../components/CustomHeader';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {moderateScale, verticalScale} from 'react-native-size-matters';

const {width: screenWidth} = Dimensions.get('window');

const CompletePujaDetailsScreen = ({navigation}: {navigation?: any}) => {
  const {t} = useTranslation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const {completePujaData} = route.params as any;

  // Destructure the data for easier access
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
  } = completePujaData || {};

  // Helper to format date (e.g., 19th September)
  const formatDateWithOrdinal = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', {month: 'long'});
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

  // Helper to get address string from address_details
  const getAddressString = (address: any) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address.full_address)
      return address.full_address;
    return '';
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <CustomHeader
        title={t('Completed Puja Details')}
        showBackButton
        showBellButton={false}
        onBackPress={() => navigation?.goBack && navigation.goBack()}
        onNotificationPress={() => {
          navigation?.navigate && navigation.navigate('NotificationScreen');
        }}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Image
            source={
              pooja_image_url
                ? {uri: pooja_image_url}
                : {
                    uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/db9492299c701c6ca2a23d6de9fc258e7ec2b5fd?width=160',
                  }
            }
            style={[
              styles.heroImage,
              {width: screenWidth, height: verticalScale(200)},
            ]}
            resizeMode="stretch"
          />
          <View
            style={{
              flex: 1,
              paddingHorizontal: moderateScale(24),
              paddingTop: verticalScale(24),
            }}>
            <Text style={styles.pujaTitle}>{pooja_name || t('Puja Name')}</Text>

            <View style={[styles.card, THEMESHADOW.shadow]}>
              <View style={styles.cardInner}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Date')}</Text>
                  <Text style={styles.detailValue}>
                    {formatDateWithOrdinal(booking_date) || '-'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Amount')}</Text>
                  <Text style={[styles.detailValue, {color: COLORS.success}]}>
                    ₹{amount || '0'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Muhurat')}</Text>
                  <Text style={styles.detailValue}>
                    {muhurat_time || '-'} {muhurat_type && `(${muhurat_type})`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Temple')}</Text>
                  <Text style={styles.detailValue}>
                    {tirth_place_name || '-'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {t('Samagri Required')}
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: samagri_required ? COLORS.success : COLORS.error,
                      },
                    ]}>
                    {samagri_required ? t('Yes') : t('No')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Payment Status')}</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {color: getStatusColor(payment_status)},
                    ]}>
                    {payment_status || '-'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Booking Status')}</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {color: getStatusColor(booking_status)},
                    ]}>
                    {booking_status || '-'}
                  </Text>
                </View>
                {notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>{t('Notes')}</Text>
                    <Text style={styles.notesValue}>{notes}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* User Card */}
            <View style={[styles.userCard, THEMESHADOW.shadow]}>
              <Image
                source={
                  booking_user_img
                    ? {uri: booking_user_img}
                    : {
                        uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/db9492299c701c6ca2a23d6de9fc258e7ec2b5fd?width=160',
                      }
                }
                style={styles.userImage}
                resizeMode="cover"
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {booking_user_name || t('User Name')}
                </Text>
                <Text style={styles.userMobile}>
                  {booking_user_mobile || t('Mobile Number')}
                </Text>
              </View>
            </View>

            {/* Address Card */}
            {address_details && (
              <View style={[styles.addressCard, THEMESHADOW.shadow]}>
                <Text style={styles.addressLabel}>{t('Address Details')}</Text>
                <Text style={styles.addressValue}>
                  {getAddressString(address_details) || '-'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
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
    backgroundColor: COLORS.primaryBackground,
  },
  scrollView: {
    flex: 1,
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
    gap: 12,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backGroundSecondary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
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
