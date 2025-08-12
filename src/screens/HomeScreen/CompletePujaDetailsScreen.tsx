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

const {width, height} = Dimensions.get('window');

const CompletePujaDetailsScreen = () => {
  const {t} = useTranslation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
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
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.primaryBackground,
        paddingTop: insets.top,
      }}>
      <CustomHeader title={t('Completed Puja Details')} showBackButton />
      <CustomeLoader loading={loading} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Puja Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={
              pooja_image_url
                ? {uri: pooja_image_url}
                : {
                    uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/db9492299c701c6ca2a23d6de9fc258e7ec2b5fd?width=160',
                  }
            }
            style={styles.pujaImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Puja Name */}
        <Text style={styles.pujaName}>{pooja_name || 'Puja Name'}</Text>

        {/* Details Card */}
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
              <Text style={styles.detailValue}>{tirth_place_name || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Samagri Required')}</Text>
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
              {booking_user_name || 'User Name'}
            </Text>
            <Text style={styles.userMobile}>
              {booking_user_mobile || 'Mobile Number'}
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
      </ScrollView>
    </View>
  );
};

export default CompletePujaDetailsScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: COLORS.backgroundPrimary,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  pujaImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Subtle overlay for contrast
  },
  pujaName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardInner: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
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
  },
  notesValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userMobile: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
});
