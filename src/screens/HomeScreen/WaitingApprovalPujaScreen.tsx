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
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import UserCustomHeader from '../../components/CustomHeader';
import PujaItemsModal from '../../components/PujaItemsModal';
import CustomModal from '../../components/CustomModal'; // Import the custom modal
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import PrimaryButton from '../../components/PrimaryButton';
import PrimaryButtonOutlined from '../../components/PrimaryButtonOutlined';
import {useTranslation} from 'react-i18next';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {useCommonToast} from '../../common/CommonToast';
import {getPandingPuja, postUpdateStatus} from '../../api/apiService';

const {width: screenWidth} = Dimensions.get('window');

type PujaDetailsType = {
  address_details?: {
    full_address?: string;
    id?: number;
  };
  address?: {
    address_line1?: string;
    address_line2?: string | null;
    city_name?: string;
    id?: number;
    name?: string;
    phone_number?: string;
    pincode?: string | null;
    state?: string | null;
    country?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    address_type?: string | null;
  };
  location_display?: string;
  amount: string;
  booking_date: string;
  booking_status: string;
  booking_user_mobile?: string;
  booking_user_name?: string;
  created_at: string;
  id: number;
  muhurat_time: string;
  muhurat_type: string;
  notes?: string;
  payment_status: string;
  pooja_id?: number;
  pooja_image_url: string;
  pooja_name: string;
  samagri_required: boolean;
  uuid: string;
  when_is_pooja?: string;
  tirth_place_name?: string;
  updated_at?: string;
  user_info?: {
    email?: string;
    full_name?: string;
    id?: number;
    mobile?: string;
    profile_img_url?: string | null;
  };
};

const WaitingApprovalPujaScreen = ({navigation}: {navigation?: any}) => {
  const {t} = useTranslation();
  const route = useRoute();
  const {id} = route.params as any;
  const inset = useSafeAreaInsets();
  const [isPujaItemsModalVisible, setIsPujaItemsModalVisible] = useState(false);
  const [pujaDetails, setPujaDetails] = useState<PujaDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
  const {showSuccessToast, showErrorToast} = useCommonToast();
  console.log('pujaDetails', pujaDetails);
  // Modal state for approval/reject
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);

  // Fetch Waiting Approval Pooja details using getPandingPuja
  const fetchPujaDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPandingPuja();
      // Assume response is either an array or an object with data array
      const data = Array.isArray(response)
        ? response[0]
        : response?.data?.[0] || response?.[0];
      if (data) {
        setPujaDetails(data);
      }
    } catch (error) {
      showErrorToast?.('Error fetching pooja details');
      console.error('Error fetching waiting approval pooja details:', error);
    } finally {
      setLoading(false);
    }
  }, [id, showErrorToast]);

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

  // Helper to get address string for display
  const getAddressDisplay = () => {
    if (pujaDetails) {
      if (pujaDetails.address_details?.full_address) {
        return pujaDetails.address_details.full_address;
      }
      if (pujaDetails.tirth_place_name) {
        return pujaDetails.tirth_place_name;
      }
      if (pujaDetails.address) {
        const {address_line1, city_name} = pujaDetails.address;
        let addressStr = '';
        if (address_line1) addressStr += address_line1;
        if (city_name) addressStr += (addressStr ? ', ' : '') + city_name;
        return addressStr;
      }
    }
    return '';
  };

  // Use postUpdateStatus for both approve and reject
  const handleApprove = async () => {
    if (!pujaDetails?.id) return;
    try {
      setLoading(true);
      await postUpdateStatus({booking_id: pujaDetails.id, action: 'accept'});
      showSuccessToast?.('Puja approved successfully');
      navigation.goBack();
    } catch (error: any) {
      showErrorToast?.(error?.response?.data?.message);
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
      await postUpdateStatus({booking_id: pujaDetails.id, action: 'reject'});
      showSuccessToast?.('Puja rejected successfully');
      navigation.goBack();
    } catch (error) {
      showErrorToast?.('Failed to reject puja');
      console.error('Reject error:', error);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setModalType(null);
    }
  };

  // Open modal for approve/reject
  const openModal = (type: 'approve' | 'reject') => {
    setModalType(type);
    setModalVisible(true);
  };

  // Modal content
  const getModalContent = () => {
    if (modalType === 'approve') {
      return {
        title: t('Approve Puja'),
        message: t('Are you sure you want to approve this puja?'),
        confirmText: t('Approve'),
        onConfirm: handleApprove,
      };
    }
    if (modalType === 'reject') {
      return {
        title: t('Reject Puja'),
        message: t('Are you sure you want to reject this puja?'),
        confirmText: t('Reject'),
        onConfirm: handleReject,
      };
    }
    return null;
  };

  const modalContent = getModalContent();

  return (
    <View style={[styles.container, {paddingTop: inset.top}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <UserCustomHeader
        title={pujaDetails?.pooja_name || 'Pooja Details'}
        showBackButton
        showBellButton
        onBackPress={handleBackPress}
        onNotificationPress={() => {
          navigation.navigate('NotificationScreen');
        }}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Image
            source={{
              uri: pujaDetails?.pooja_image_url,
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
            <Text style={styles.pujaTitle}>{pujaDetails?.pooja_name}</Text>

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
                    {pujaDetails?.when_is_pooja || pujaDetails?.booking_date}
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
                      uri:
                        pujaDetails?.user_info?.profile_img_url ||
                        'https://api.builder.io/api/v1/image/assets/TEMP/0dd21e4828d095d395d4c9eadfb3a0b6c7aee7bd?width=80',
                    }}
                    style={styles.priestImage}
                  />
                  <View style={styles.priestImageBorder} />
                </View>
                <Text style={styles.priestName}>
                  {pujaDetails?.booking_user_name ||
                    pujaDetails?.user_info?.full_name}
                </Text>
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
    lineHeight: moderateScale(22),
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
    letterSpacing: -0.33,
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
    letterSpacing: -0.33,
  },
  pricingAmount: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    fontWeight: '600',
    letterSpacing: -0.33,
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
