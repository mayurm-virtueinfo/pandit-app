import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  DeviceEventEmitter,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import UserCustomHeader from '../../components/CustomHeader';
import PujaItemsModal from '../../components/PujaItemsModal';
import CustomModal from '../../components/CustomModal';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import PrimaryButton from '../../components/PrimaryButton';
import PrimaryButtonOutlined from '../../components/PrimaryButtonOutlined';
import {useTranslation} from 'react-i18next';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {useCommonToast} from '../../common/CommonToast';
import {getBookingAutoDetails, postUpdateStatus} from '../../api/apiService';

const {width: screenWidth} = Dimensions.get('window');

type SamagriItem = {
  name: string;
  quantity: number;
  units: string;
};

type SamagriDetails = {
  user_items: SamagriItem[];
  pandit_items: SamagriItem[];
};

type PujaDetailsType = {
  id: number;
  amount: string | null;
  booking_date: string;
  muhurat_time: string;
  muhurat_type: string;
  samagri_required: boolean;
  samagri_details?: SamagriDetails;
  location: {
    details?: any;
    type?: string;
  };
  pooja: {
    id: number;
    name: string;
    image_url: string | null;
    description: string;
  };
  profile_img: string;
  user: {
    id: number;
    name: string;
  };
  offer_id: number;
};

const WaitingApprovalPujaScreen = ({navigation}: {navigation?: any}) => {
  const {t} = useTranslation();
  const route = useRoute();
  const {booking_id, offer_id} = route?.params as any;
  const inset = useSafeAreaInsets();
  const [isPujaItemsModalVisible, setIsPujaItemsModalVisible] = useState(false);
  const [pujaDetails, setPujaDetails] = useState<PujaDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
  const {showSuccessToast, showErrorToast} = useCommonToast();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);

  console.log('booking_id in WaitingApprovalPujaScreen :: ', booking_id);
  console.log('offer_id in WaitingApprovalPujaScreen :: ', offer_id);
  console.log('pujaDetails in WaitingApprovalPujaScreen :: ', pujaDetails);

  const fetchPujaDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await getBookingAutoDetails(booking_id);
      console.log('response', response);
      if (response?.data) {
        setPujaDetails(response.data);
      } else {
        setPujaDetails(null);
      }
    } catch (error) {
      showErrorToast?.('Error fetching pooja details');
      console.error('Error fetching waiting approval pooja details:', error);
    } finally {
      setLoading(false);
    }
  }, [showErrorToast, booking_id]);

  useFocusEffect(
    useCallback(() => {
      fetchPujaDetails();
    }, []),
  );

  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleOpenPujaItemsModal = () => {
    setIsPujaItemsModalVisible(true);
  };

  const handleClosePujaItemsModal = () => {
    setIsPujaItemsModalVisible(false);
  };

  const getAddressDisplay = () => {
    if (!pujaDetails?.location?.type || !pujaDetails.location.details)
      return '';
    const {type, details} = pujaDetails.location;
    if (type === 'address') {
      if (details.full_address) return details.full_address;
      let addressStr = '';
      if (details.address_line1) addressStr += details.address_line1;
      if (details.city) addressStr += (addressStr ? ', ' : '') + details.city;
      if (details.state) addressStr += (addressStr ? ', ' : '') + details.state;
      if (details.pincode)
        addressStr += (addressStr ? ', ' : '') + details.pincode;
      return addressStr || JSON.stringify(details);
    }
    if (type === 'tirth_place') {
      let tirthStr = '';
      if (details.name) tirthStr += details.name;
      if (details.city) tirthStr += (tirthStr ? ', ' : '') + details.city;
      if (details.description)
        tirthStr += (tirthStr ? ' - ' : '') + details.description;
      return tirthStr;
    }
    return '';
  };

  const handleApprove = async () => {
    if (!pujaDetails?.id) return;
    try {
      setLoading(true);
      await postUpdateStatus({
        booking_id: booking_id,
        action: 'accept',
        offer_id: offer_id || pujaDetails?.offer_id,
      });
      showSuccessToast?.(t('puja_approve'));

      // 🔥 Emit event to update HomeScreen instantly
      DeviceEventEmitter.emit('PUJA_DATA_UPDATED');

      navigation.goBack();
    } catch (error: any) {
      showErrorToast?.(
        error?.response?.data?.message || 'Failed to approve puja',
      );
      console.error('Approve error:', error);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setModalType(null);
    }
  };

  const handleReject = async () => {
    if (!pujaDetails?.id) return;
    try {
      setLoading(true);
      await postUpdateStatus({
        booking_id: booking_id,
        action: 'reject',
        offer_id: offer_id || pujaDetails?.offer_id,
      });
      showSuccessToast?.(t('puja_reject'));

      // 🔥 Emit event to update HomeScreen instantly
      DeviceEventEmitter.emit('PUJA_DATA_UPDATED');

      navigation.goBack();
    } catch (error: any) {
      navigation.goBack();
      console.error('Reject error:', error?.response?.data?.message);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setModalType(null);
    }
  };

  const openModal = (type: 'approve' | 'reject') => {
    setModalType(type);
    setModalVisible(true);
  };

  const getModalContent = () => {
    if (modalType === 'approve') {
      return {
        title: t('approve_puja'),
        message: t('approve_puja_message'),
        confirmText: t('Approve'),
        onConfirm: handleApprove,
      };
    }
    if (modalType === 'reject') {
      return {
        title: t('reject_puja'),
        message: t('reject_puja_message'),
        confirmText: t('Reject'),
        onConfirm: handleReject,
      };
    }
    return null;
  };

  const modalContent = getModalContent();

  // Compose items for PujaItemsModal from samagri_details
  const getPujaItemsForModal = () => {
    if (!pujaDetails?.samagri_details) return [];
    return [
      {
        title: 'User Items',
        data: pujaDetails.samagri_details.user_items || [],
      },
      {
        title: 'Pandit Items',
        data: pujaDetails.samagri_details.pandit_items || [],
      },
    ];
  };

  // Fallback image for priest
  const fallbackPriestImage =
    'https://api.builder.io/api/v1/image/assets/TEMP/0dd21e4828d095d395d4c9eadfb3a0b6c7aee7bd?width=80';

  // Fallback image for pooja
  const fallbackPoojaImage =
    'https://api.builder.io/api/v1/image/assets/TEMP/0dd21e4828d095d395d4c9eadfb3a0b6c7aee7bd?width=400';

  return (
    <View style={[styles.container, {paddingTop: inset.top}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <UserCustomHeader
        title={pujaDetails?.pooja?.name || 'Pooja Details'}
        showBackButton
        // showBellButton
        onBackPress={handleBackPress}
        // onNotificationPress={() => {
        //   navigation.navigate('NotificationScreen');
        // }}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Image
            source={{
              uri: pujaDetails?.pooja?.image_url || fallbackPoojaImage,
            }}
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
            <Text style={styles.pujaTitle}>{pujaDetails?.pooja?.name}</Text>

            <View style={[styles.detailsCard, THEMESHADOW.shadow]}>
              <View style={styles.detailItem}>
                <Octicons
                  name="location"
                  size={24}
                  color={COLORS.pujaCardSubtext}
                  style={styles.detailIcon}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailText}>{getAddressDisplay()}</Text>
                </View>
              </View>
              <View style={styles.separator} />

              <View style={styles.detailItem}>
                <Octicons
                  name="calendar"
                  size={24}
                  color={COLORS.pujaCardSubtext}
                  style={styles.detailIcon}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailText}>
                    {pujaDetails?.booking_date}
                  </Text>
                </View>
              </View>
              <View style={styles.separator} />

              <View style={styles.detailItem}>
                <MaterialIcons
                  name="access-time"
                  size={24}
                  color={COLORS.pujaCardSubtext}
                  style={styles.detailIcon}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailText}>
                    {pujaDetails?.muhurat_time}
                  </Text>
                </View>
              </View>
              <View style={styles.separator} />

              <TouchableOpacity
                style={styles.detailItem}
                onPress={handleOpenPujaItemsModal}>
                <MaterialIcons
                  name="list-alt"
                  size={24}
                  color={COLORS.pujaCardSubtext}
                  style={styles.detailIcon}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailText}>Pooja items list</Text>
                </View>
                <Feather
                  name="eye"
                  size={20}
                  color={COLORS.primaryBackgroundButton}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.priestCard, THEMESHADOW.shadow]}>
              <View style={styles.priestInfo}>
                <View style={styles.priestImageContainer}>
                  <Image
                    source={{
                      uri: pujaDetails?.profile_img || fallbackPriestImage,
                    }}
                    style={styles.priestImage}
                  />
                  <View style={styles.priestImageBorder} />
                </View>
                <Text style={styles.priestName}>{pujaDetails?.user?.name}</Text>
              </View>
            </View>

            <View style={[styles.pricingCard, THEMESHADOW.shadow]}>
              <View style={styles.pricingContent}>
                <Text style={styles.pricingLabel}>Pooja Pricing</Text>
                <Text style={styles.pricingSubtext}>
                  {pujaDetails?.samagri_required
                    ? 'With Pooja Items'
                    : 'Without Pooja Items'}
                </Text>
              </View>
              <Text style={styles.pricingAmount}>
                {pujaDetails?.amount ? `₹${pujaDetails.amount}` : ''}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <PrimaryButtonOutlined
                title={t('Reject')}
                onPress={() => openModal('reject')}
                style={styles.button}
                disabled={loading}
              />
              <PrimaryButton
                title={t('Approve')}
                onPress={() => openModal('approve')}
                style={styles.button}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <PujaItemsModal
        visible={isPujaItemsModalVisible}
        onClose={handleClosePujaItemsModal}
        // items={getPujaItemsForModal()}
        userItems={pujaDetails?.samagri_details?.user_items}
        panditItems={pujaDetails?.samagri_details?.pandit_items}
      />

      {/* Custom Modal for Approve/Reject */}
      <CustomModal
        visible={modalVisible}
        title={modalContent?.title}
        message={modalContent?.message}
        confirmText={modalContent?.confirmText}
        onConfirm={modalContent?.onConfirm}
        onCancel={() => {
          setModalVisible(false);
          setModalType(null);
        }}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  heroImage: {},
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.pujaBackground,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  pujaTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    fontWeight: '600',
    marginBottom: verticalScale(12),
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    paddingHorizontal: verticalScale(12),
    marginBottom: verticalScale(24),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  detailIcon: {
    marginRight: moderateScale(14),
    width: moderateScale(24),
  },
  detailContent: {
    flex: 1,
  },
  detailText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
  },
  priestCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    marginBottom: verticalScale(24),
  },
  priestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priestImageContainer: {
    position: 'relative',
    marginRight: moderateScale(14),
  },
  priestImage: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
  },
  priestImageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: COLORS.separatorColor,
  },
  priestName: {
    flex: 1,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    fontWeight: '500',
  },
  pricingCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    marginBottom: verticalScale(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingContent: {
    gap: 6,
  },
  pricingLabel: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    fontWeight: '500',
  },
  pricingAmount: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    fontWeight: '600',
  },
  pricingSubtext: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.pujaCardSubtext,
    fontWeight: '500',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(24),
    marginBottom: verticalScale(24),
  },
  button: {
    flex: 1,
    height: moderateScale(46),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
});

export default WaitingApprovalPujaScreen;
