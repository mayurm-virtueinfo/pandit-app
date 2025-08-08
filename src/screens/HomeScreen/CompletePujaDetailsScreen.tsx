import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import CustomeLoader from '../../components/CustomLoader';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

const CompletePujaDetailsScreen = () => {
  const {t} = useTranslation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const {completePujaData} = route.params as any;
  // console.log('completePujaData', completePujaData);
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
    const s = ['th', 'st', 'nd', 'rd'],
      v = day % 100;
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
    <View
      style={{
        backgroundColor: COLORS.primaryBackground,
        paddingTop: insets.top,
        flex: 1,
      }}>
      <CustomHeader title={t('Completed Puja Details')} showBackButton />
      <CustomeLoader loading={loading} />
      <View
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: COLORS.backgroundPrimary,
          flex: 1,
        }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}>
          {/* Puja Image and Name OUTSIDE Card */}
          <View style={styles.pujaImageWrapper}>
            <Image
              source={
                pooja_image_url
                  ? {uri: pooja_image_url}
                  : {
                      uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/db9492299c701c6ca2a23d6de9fc258e7ec2b5fd?width=160',
                    }
              }
              style={styles.pujaImage}
              resizeMode="stretch"
            />
            <View style={styles.pujaImageOverlay} />
          </View>
          <Text style={styles.pujaName}>{pooja_name}</Text>

          {/* Puja Card */}
          <View style={[styles.card, THEMESHADOW.shadow]}>
            <View style={styles.cardInner}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('Date')}</Text>
                  <Text style={styles.infoValue}>
                    {formatDateWithOrdinal(booking_date)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('Amount')}</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {color: COLORS.success || '#2ecc71', fontWeight: '700'},
                    ]}>
                    ₹{amount}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('Muhurat')}</Text>
                  <Text style={styles.infoValue}>
                    {muhurat_time}{' '}
                    {muhurat_type ? (
                      <Text
                        style={{
                          color: COLORS.textSecondary,
                        }}>{`(${muhurat_type})`}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('Temple')}</Text>
                  <Text style={styles.infoValue}>
                    {tirth_place_name || '-'}
                  </Text>
                </View>
              </View>
              {/* Divider REMOVED from here */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('Samagri Required')}</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: samagri_required
                        ? COLORS.success || '#2ecc71'
                        : COLORS.error || '#e74c3c',
                      fontWeight: '600',
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
                    {color: getStatusColor(payment_status), fontWeight: '600'},
                  ]}>
                  {payment_status}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('Booking Status')}</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {color: getStatusColor(booking_status), fontWeight: '600'},
                  ]}>
                  {booking_status}
                </Text>
              </View>
              {notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>{t('Notes')}</Text>
                  <Text style={styles.notesValue}>{notes}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {/* User Card */}
          <View style={[styles.userCard, THEMESHADOW.shadow]}>
            <View style={styles.userImageWrapper}>
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
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.userName}>{booking_user_name}</Text>
              <Text style={styles.userMobile}>{booking_user_mobile}</Text>
            </View>
          </View>
          {/* Address Card */}
          {address_details ? (
            <View style={[styles.addressCard, THEMESHADOW.shadow]}>
              <Text style={styles.addressLabel}>{t('Address Details')}</Text>
              <Text style={styles.addressValue}>
                {getAddressString(address_details)}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
};

export default CompletePujaDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 18,
    minHeight: '100%',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    marginBottom: 28,
    overflow: 'hidden', // Added to prevent content overflow
  },
  cardInner: {
    padding: 18, // Reduced from 24 to 18 for better fit
  },
  pujaImageWrapper: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    alignSelf: 'center',
    width: '100%',
    height: width * 0.45,
  },
  pujaImage: {
    width: '100%',
    height: '100%',
  },
  pujaImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pujaName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.04)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
    flexWrap: 'wrap', // Added to allow wrapping if content is too wide
  },
  infoItem: {
    flex: 1, // Changed from flex: 2 to flex: 1 for better fit
    flexDirection: 'column', // Changed from 'row' to 'column' for stacking label/value
    minWidth: 100,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 5,
    marginRight: 10, // Added spacing between items
    maxWidth: '48%', // Prevents overflow in row
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  infoValue: {
    fontSize: 17,
    color: COLORS.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.1,
    flexShrink: 1, // Prevents overflow
    flexWrap: 'wrap', // Allows text to wrap
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.backgroundPrimary,
    marginVertical: 16,
    borderRadius: 1,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    flexWrap: 'wrap', // Added to allow wrapping if content is too wide
  },
  detailLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.1,
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
    letterSpacing: 0.1,
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  notesBox: {
    backgroundColor: COLORS.backgroundPrimary,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notesLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  notesValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    gap: 12,
  },
  userImageWrapper: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 18,
    width: 70,
    height: 70,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#eee',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  userMobile: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    // marginBottom: 24,
  },
  addressLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  addressValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});
