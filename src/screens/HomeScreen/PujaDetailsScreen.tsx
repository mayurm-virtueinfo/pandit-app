import React, {useState, useEffect, useCallback} from 'react';
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
import CodeVerificationModal from '../../components/CodeVerificationModal';
import PujaItemsModal from '../../components/PujaItemsModal';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import PrimaryButton from '../../components/PrimaryButton';
import PrimaryButtonOutlined from '../../components/PrimaryButtonOutlined';
import {useTranslation} from 'react-i18next';
import {
  getUpcomingPujaDetails,
  postCompetePuja,
  postStartPuja,
  getInProgressPuja,
} from '../../api/apiService';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const STORAGE_KEY_PREFIX = 'puja_status_';

const PujaDetailsScreen = ({navigation}: {navigation?: any}) => {
  const {t} = useTranslation();
  const route = useRoute();
  const {id, progress} = route.params as any;
  const inset = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pujaStarted, setPujaStarted] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [isPujaItemsModalVisible, setIsPujaItemsModalVisible] = useState(false);
  const [pujaDetails, setPujaDetails] = useState<PujaDetailsType | null>(null);
  const [progressPujaDetails, setProgressPujaDetails] =
    useState<PujaDetailsType | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  // Helper to get the correct booking id for status
  console.log('progressPujaDetails', progressPujaDetails);
  const getBookingId = () => {
    if (progress) {
      return progressPujaDetails?.id;
    }
    return pujaDetails?.id || id;
  };

  // Fetch puja details
  const fetchPujaDetails = useCallback(async () => {
    try {
      let response;
      if (progress) {
        response = await getInProgressPuja();
        const data = Array.isArray(response)
          ? response[0]
          : response?.data?.[0] || response?.[0];
        if (data) {
          setProgressPujaDetails(data);
        }
      } else {
        response = await getUpcomingPujaDetails(id);
        const data = Array.isArray(response)
          ? response[0]
          : response?.data?.[0] || response?.[0];
        if (data) {
          setPujaDetails(data);
        }
      }
    } catch (error) {
      console.error('Error fetching puja details:', error);
    }
  }, [id, progress]);

  // Load puja started/completed status from AsyncStorage
  const loadPujaStatus = useCallback(
    async (bookingId: number | string | undefined) => {
      if (!bookingId) {
        setPujaStarted(false);
        return;
      }
      try {
        const status = await AsyncStorage.getItem(
          `${STORAGE_KEY_PREFIX}${bookingId}`,
        );
        if (status === 'started') {
          setPujaStarted(true);
        } else {
          setPujaStarted(false);
        }
      } catch (error) {
        console.error('Error loading puja status from storage:', error);
      }
    },
    [],
  );

  // Fetch details and status on focus (when coming to this screen)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchAll = async () => {
        await fetchPujaDetails();
      };
      fetchAll();
      return () => {
        isActive = false;
      };
    }, [fetchPujaDetails]),
  );

  // When pujaDetails or progressPujaDetails changes, load status
  useEffect(() => {
    const bookingId = getBookingId();
    if (bookingId) {
      loadPujaStatus(bookingId);
    }
  }, [pujaDetails, progressPujaDetails, id, progress, loadPujaStatus]);

  // Call Start Puja API and store status in AsyncStorage
  const handleStartPujaApi = async (pin: string) => {
    const bookingId = pujaDetails?.id || progressPujaDetails?.id;
    if (!bookingId) {
      console.error('No booking id found for starting puja');
      return;
    }
    try {
      const data = {
        booking_id: bookingId,
        pin: pin,
      };
      await postStartPuja(data);
      setPujaStarted(true);
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${bookingId}`,
        'started',
      );
    } catch (error) {
      console.error('Error starting puja:', error);
    }
  };

  // Call Complete Puja API and update status in AsyncStorage
  const handleCompletePujaApi = async (pin: string) => {
    const bookingId = progressPujaDetails?.id || pujaDetails?.id;
    if (!bookingId) {
      console.error('No booking id found for completing puja');
      return;
    }
    try {
      const data = {
        booking_id: bookingId,
        pin: pin,
      };
      await postCompetePuja(data);
      setPujaStarted(false);
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${bookingId}`,
        'completed',
      );
      navigation?.navigate('PujaSuccessfull');
    } catch (error) {
      console.error('Error completing puja:', error);
    }
  };

  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleStartPuja = () => {
    setIsModalVisible(true);
  };

  const handleCodeSubmit = (pin: string) => {
    setEnteredPin(pin);
    if (isModalVisible) {
      setIsModalVisible(false);
      handleStartPujaApi(pin);
    }
    if (isCompleteModalVisible) {
      setIsCompleteModalVisible(false);
      handleCompletePujaApi(pin);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setIsCompleteModalVisible(false);
  };

  const handleCompletePuja = () => {
    setIsCompleteModalVisible(true);
  };

  const handleOpenPujaItemsModal = () => {
    setIsPujaItemsModalVisible(true);
  };

  const handleClosePujaItemsModal = () => {
    setIsPujaItemsModalVisible(false);
  };

  // Helper to get address string for display
  const getAddressDisplay = () => {
    // For progressPujaDetails, prefer location_display, else build from address
    if (progress && progressPujaDetails) {
      if (progressPujaDetails.location_display) {
        return progressPujaDetails.location_display;
      }
      if (progressPujaDetails.address) {
        const {address_line1, city_name} = progressPujaDetails.address;
        let addressStr = '';
        if (address_line1) addressStr += address_line1;
        if (city_name) addressStr += (addressStr ? ', ' : '') + city_name;
        return addressStr;
      }
      // fallback to tirth_place_name
      if (progressPujaDetails.tirth_place_name) {
        return progressPujaDetails.tirth_place_name;
      }
    }
    // For pujaDetails (upcoming), fallback to old logic
    if (pujaDetails) {
      if (pujaDetails.address_details?.full_address) {
        return pujaDetails.address_details.full_address;
      }
      if (pujaDetails.tirth_place_name) {
        return pujaDetails.tirth_place_name;
      }
    }
    return '';
  };

  return (
    <View style={[styles.container, {paddingTop: inset.top}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <UserCustomHeader
        title={
          pujaDetails?.pooja_name ||
          progressPujaDetails?.pooja_name ||
          'Puja Details'
        }
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
              uri:
                pujaDetails?.pooja_image_url ||
                progressPujaDetails?.pooja_image_url,
            }}
            style={[
              styles.heroImage,
              {width: screenWidth, height: verticalScale(200)},
            ]}
            resizeMode="cover"
          />
          <View
            style={{
              flex: 1,
              paddingHorizontal: moderateScale(24),
              paddingTop: verticalScale(24),
            }}>
            <Text style={styles.pujaTitle}>
              {pujaDetails?.pooja_name || progressPujaDetails?.pooja_name}
            </Text>

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
                    {pujaDetails?.when_is_pooja ||
                      progressPujaDetails?.booking_date}
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
                    {pujaDetails?.muhurat_time ||
                      progressPujaDetails?.muhurat_time}
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
                  <Text style={styles.detailText}>Puja items list</Text>
                </View>
                <Feather name="eye" size={20} color="#FFBE11" />
              </TouchableOpacity>
            </View>

            <View style={[styles.priestCard, THEMESHADOW.shadow]}>
              <View style={styles.priestInfo}>
                <View style={styles.priestImageContainer}>
                  <Image
                    source={{
                      uri:
                        progressPujaDetails?.user_info?.profile_img_url ||
                        'https://api.builder.io/api/v1/image/assets/TEMP/0dd21e4828d095d395d4c9eadfb3a0b6c7aee7bd?width=80',
                    }}
                    style={styles.priestImage}
                  />
                  <View style={styles.priestImageBorder} />
                </View>
                <Text style={styles.priestName}>
                  {pujaDetails?.booking_user_name ||
                    progressPujaDetails?.user_info?.full_name}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ChatScreen');
                  }}
                  style={styles.chatButton}>
                  <Image
                    source={{
                      uri: 'https://api.builder.io/api/v1/image/assets/TEMP/4c01dc3358caeee996c8d4195776dbf1f8045f61?width=40',
                    }}
                    style={styles.chatIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.pricingCard, THEMESHADOW.shadow]}>
              <View style={styles.pricingContent}>
                <Text style={styles.pricingLabel}>Pooja Pricing</Text>
                <Text style={styles.pricingSubtext}>
                  {pujaDetails?.samagri_required ||
                  progressPujaDetails?.samagri_required
                    ? 'With Puja Items'
                    : 'Without Puja Items'}
                </Text>
              </View>
              <Text style={styles.pricingAmount}>
                {pujaDetails?.amount
                  ? `₹${pujaDetails.amount}`
                  : `₹${progressPujaDetails?.amount}`}
              </Text>
            </View>

            {!pujaStarted ? (
              <View style={styles.buttonContainer}>
                <PrimaryButtonOutlined
                  title={t('cancel')}
                  onPress={() => {
                    navigation.navigate('PujaCancellationScreen', {id: id});
                  }}
                  style={styles.button}
                />
                <PrimaryButton
                  title={t('start')}
                  onPress={handleStartPuja}
                  style={styles.button}
                />
              </View>
            ) : (
              <View style={{marginBottom: verticalScale(24)}}>
                <PrimaryButton
                  title={t('complete_puja')}
                  onPress={handleCompletePuja}
                  style={styles.button}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <CodeVerificationModal
        visible={isModalVisible || isCompleteModalVisible}
        onClose={handleModalClose}
        onSubmit={handleCodeSubmit}
        onCancel={handleModalClose}
      />

      <PujaItemsModal
        visible={isPujaItemsModalVisible}
        onClose={handleClosePujaItemsModal}
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
  chatButton: {
    padding: moderateScale(4),
  },
  chatIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
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

export default PujaDetailsScreen;
