import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  postConversations,
} from '../../api/apiService';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCommonToast} from '../../common/CommonToast';
import {
  translateData,
  translateOne,
  translateText,
} from '../../utils/TranslateData';
import {Images} from '../../theme/Images';

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
  profile_img_url: string;
  booking_user_img: string;
  user_info?: {
    email?: string;
    full_name?: string;
    id?: number;
    mobile?: string;
    profile_img_url?: string | null;
  };
  pandit_arranged_items?: Array<{
    name: string;
    quantity: number;
    units: string;
  }>;
  user_arranged_items?: Array<{name: string; quantity: number; units: string}>;
  is_cos?: boolean;
};

const PujaDetailsScreen = ({navigation}: {navigation?: any}) => {
  const {t, i18n} = useTranslation();
  const route = useRoute();
  const {id, progress} = route.params as any;
  const inset = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [isPujaItemsModalVisible, setIsPujaItemsModalVisible] = useState(false);
  const [pujaDetails, setPujaDetails] = useState<PujaDetailsType | null>(null);
  const [progressPujaDetails, setProgressPujaDetails] =
    useState<PujaDetailsType | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const currentLanguage = i18n.language;
  const [translatedPujaDetails, setTranslatedPujaDetails] = useState<any>(null);
  const [translatedProgressPujaDetails, setTranslatedProgressPujaDetails] =
    useState<any>(null);

  const {showSuccessToast, showErrorToast} = useCommonToast();

  console.log('translatedPujaDetails :: ', translatedPujaDetails);

  const pujaTranslationCacheRef = useRef(new Map());
  const progressPujaTranslationCacheRef = useRef(new Map());

  const bookingStatus =
    progressPujaDetails?.booking_status || pujaDetails?.booking_status;

  // Helper to get is_cos value from either pujaDetails or progressPujaDetails
  const getIsCos = () => {
    if (
      progress &&
      progressPujaDetails &&
      typeof progressPujaDetails.is_cos === 'boolean'
    ) {
      return progressPujaDetails.is_cos;
    }
    if (pujaDetails && typeof pujaDetails.is_cos === 'boolean') {
      return pujaDetails.is_cos;
    }
    return false;
  };

  // Fetch Pooja details
  const fetchPujaDetails = useCallback(async () => {
    try {
      const inProgressPujaCachedData =
        progressPujaTranslationCacheRef.current.get(currentLanguage);
      const pujaDetailsCachedData =
        pujaTranslationCacheRef.current.get(currentLanguage);
      if (inProgressPujaCachedData) {
        setTranslatedProgressPujaDetails(inProgressPujaCachedData);
        return;
      }
      if (pujaDetailsCachedData) {
        setTranslatedPujaDetails(pujaDetailsCachedData);
        return;
      }
      let response: any;
      if (progress) {
        response = await getInProgressPuja();
        console.log('response for in progress puja :: ', response?.data);
        const data = Array.isArray((response as any) || [])
          ? (response as any)[0]
          : (response as any)?.data?.[0] || (response as any)?.[0];
        if (data) {
          setProgressPujaDetails(data);
          const translatedData: any = await translateData(
            data,
            currentLanguage,
            [
              'pooja_name',
              'when_is_pooja',
              'booking_user_name',
              'pandit_arranged_items',
              'user_arranged_items',
              'address_details',
            ],
          );
          translatedData.address_details.full_address = await translateText(
            translatedData.address_details.full_address,
            currentLanguage,
          );
          translatedData.tirth_place_name = await translateText(
            translatedData.tirth_place_name,
            currentLanguage,
          );
          pujaTranslationCacheRef.current.set(currentLanguage, translatedData);
          setTranslatedProgressPujaDetails(translatedData);
        }
      } else {
        response = await getUpcomingPujaDetails(id);
        const data = Array.isArray((response as any) || [])
          ? (response as any)[0]
          : (response as any)?.data?.[0] || (response as any)?.[0];
        if (data) {
          setPujaDetails(data);
          const translatedData: any = await translateData(
            data,
            currentLanguage,
            [
              'pooja_name',
              'when_is_pooja',
              'booking_user_name',
              'pandit_arranged_items',
              'user_arranged_items',
              'address_details',
            ],
          );
          translatedData.address_details.full_address = await translateText(
            translatedData.address_details.full_address,
            currentLanguage,
          );
          translatedData.tirth_place_name = await translateText(
            translatedData.tirth_place_name,
            currentLanguage,
          );
          pujaTranslationCacheRef.current.set(currentLanguage, translatedData);
          setTranslatedPujaDetails(translatedData);
        }
      }
    } catch (error) {
      console.error('Error fetching pooja details:', error);
    }
  }, [id, progress, currentLanguage]);

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

  // Call Start Pooja API and store status in AsyncStorage
  const handleStartPujaApi = async (pin: string) => {
    if (!id) {
      console.error('No booking id found for starting pooja');
      return;
    }
    try {
      const data = {
        booking_id: id,
        pin: pin,
      };
      const response: any = await postStartPuja(data);
      if (response) {
        console.log('Response from starting pooja :: ', response);

        navigation.reset({
          index: 0,
          routes: [{name: 'HomeScreen'}],
        });
        return response;
      }
    } catch (error: any) {
      let errorMsg = 'Something went wrong';
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      showErrorToast(errorMsg);
      console.error('Error starting pooja:', error);
    }
  };

  // Call Complete Pooja API and update status in AsyncStorage
  const handleCompletePujaApi = async (pin: string) => {
    if (!id) {
      console.error('No booking id found for completing pooja');
      return;
    }
    try {
      const data = {
        booking_id: id,
        pin: pin,
      };
      await postCompetePuja(data);
      navigation?.navigate('PujaSuccessfull', {bookingId: id});
    } catch (error: any) {
      let errorMsg = 'Something went wrong';
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      showErrorToast(errorMsg);
      console.error('Error completing pooja:', error);
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

  const getAddressDisplay = () => {
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
      if (progressPujaDetails.address_details) {
        const {full_address} = progressPujaDetails.address_details;
        let addressStr = '';
        if (full_address) addressStr += full_address;
        return addressStr;
      }
      if (progressPujaDetails.tirth_place_name) {
        return progressPujaDetails.tirth_place_name;
      }
    }
    if (pujaDetails) {
      if (pujaDetails.address_details?.full_address) {
        return pujaDetails.address_details.full_address;
      }
      if (translatedPujaDetails.tirth_place_name) {
        return translateText(
          translatedPujaDetails.tirth_place_name,
          currentLanguage,
        );
      }
    }
    return '';
  };

  const handleOnChatClick = async () => {
    if (progressPujaDetails?.booking_status === 'in_progress') {
      showErrorToast?.(
        'You cannot chat with the pandit after the pooja has started.',
      );
      return;
    }
    try {
      if (!id) {
        showErrorToast?.('User information not available for chat');
        return;
      }

      const conversationRes = await postConversations({booking_id: id});
      const conversationData = conversationRes?.data || conversationRes;
      const conversationUuid =
        conversationData?.uuid ||
        conversationData?.data?.uuid ||
        conversationData?.conversation?.uuid;

      if (!conversationUuid) {
        showErrorToast?.('Could not start chat. Please try again.');
        return;
      }

      navigation.navigate('ChatScreen', {
        booking_id: id,
        other_user_name: conversationData.other_participant_name,
        other_user_image: conversationData.other_participant_profile_img,
        other_user_phone:
          conversationData.other_participant_number || '2222222222',
      });
    } catch (error) {
      showErrorToast?.('Failed to start chat. Please try again.');
      console.error('handleOnChatClick error:', error);
    }
  };

  const getPanditArrangedItems = () => {
    if (
      progress &&
      translatedProgressPujaDetails &&
      Array.isArray(translatedProgressPujaDetails.pandit_arranged_items)
    ) {
      return translatedProgressPujaDetails.pandit_arranged_items;
    }
    if (
      translatedPujaDetails &&
      Array.isArray(translatedPujaDetails.pandit_arranged_items)
    ) {
      return translatedPujaDetails.pandit_arranged_items;
    }
    return [];
  };

  const getUserArrangedItems = () => {
    if (
      progress &&
      translatedProgressPujaDetails &&
      Array.isArray(translatedProgressPujaDetails.user_arranged_items)
    ) {
      return translatedProgressPujaDetails.user_arranged_items;
    }
    if (
      translatedPujaDetails &&
      Array.isArray(translatedPujaDetails.user_arranged_items)
    ) {
      return translatedPujaDetails.user_arranged_items;
    }
    return [];
  };

  const renderPaymentInfo = () => {
    const isCos = getIsCos();
    if (isCos) {
      return (
        <View style={styles.paymentInfoContainer}>
          <Text style={styles.paymentInfoText}>{t('payment_cos_desc')}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.paymentInfoContainer}>
          <Text style={styles.paymentInfoText}>{t('payment_no_cos_desc')}</Text>
        </View>
      );
    }
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
          translatedPujaDetails?.pooja_name ||
          progressPujaDetails?.pooja_name ||
          'Pooja Details'
        }
        showBackButton
        onBackPress={handleBackPress}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Image
            source={{
              uri:
                translatedPujaDetails?.pooja_image_url ||
                progressPujaDetails?.pooja_image_url,
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
            <Text style={styles.pujaTitle}>
              {translatedPujaDetails?.pooja_name ||
                progressPujaDetails?.pooja_name}
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
                  <Text style={styles.detailText}>
                    {translatedPujaDetails?.address_details?.full_address ||
                      translatedProgressPujaDetails?.address_details
                        ?.full_address ||
                      translatedPujaDetails?.tirth_place_name ||
                      translatedProgressPujaDetails?.tirth_place_name}
                  </Text>
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
                    {translatedPujaDetails?.when_is_pooja ||
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
                    {translatedPujaDetails?.muhurat_time ||
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
                  <Text style={styles.detailText}>
                    {t('list_of_pooja_items')}
                  </Text>
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
                        progressPujaDetails?.profile_img_url ||
                        pujaDetails?.booking_user_img ||
                        'https://api.builder.io/api/v1/image/assets/TEMP/0dd21e4828d095d395d4c9eadfb3a0b6c7aee7bd?width=80',
                    }}
                    style={styles.priestImage}
                  />
                  <View style={styles.priestImageBorder} />
                </View>
                <Text style={styles.priestName}>
                  {translatedPujaDetails?.booking_user_name ||
                    progressPujaDetails?.user_info?.full_name ||
                    progressPujaDetails?.booking_user_name}
                </Text>
                <TouchableOpacity
                  onPress={handleOnChatClick}
                  style={styles.chatButton}>
                  <Image
                    source={Images.ic_message}
                    style={[styles.chatIcon && {opacity: 0.5}]}
                    tintColor={COLORS.primaryBackgroundButton}
                  />
                </TouchableOpacity>
              </View>
              {bookingStatus == 'in_progress' && (
                <Text
                  style={{
                    color: COLORS.error,
                    marginTop: 8,
                    fontSize: moderateScale(12),
                  }}>
                  {t('chat_with_pandit_after_puja_started', {
                    name:
                      translatedPujaDetails?.booking_user_name ||
                      progressPujaDetails?.user_info?.full_name ||
                      progressPujaDetails?.booking_user_name ||
                      '',
                  })}
                </Text>
              )}
            </View>

            <View style={[styles.pricingCard, THEMESHADOW.shadow]}>
              <View style={styles.pricingContent}>
                <Text style={styles.pricingLabel}>{t('pooja_pricing')}</Text>
                <Text style={styles.pricingSubtext}>
                  {translatedPujaDetails?.samagri_required ||
                  progressPujaDetails?.samagri_required
                    ? t('with_puja_items')
                    : t('without_puja_items')}
                </Text>
              </View>
              <Text style={styles.pricingAmount}>
                {translatedPujaDetails?.amount
                  ? `₹${translatedPujaDetails?.amount}`
                  : `₹${progressPujaDetails?.amount}`}
              </Text>
            </View>

            {/* Payment Info Section */}
            {renderPaymentInfo()}
          </View>
        </ScrollView>

        {bookingStatus == 'accepted' && (
          <View style={styles.buttonContainer}>
            <PrimaryButtonOutlined
              title={t('cancel')}
              onPress={() =>
                navigation.navigate('PujaCancellationScreen', {id})
              }
              style={styles.button}
            />
            <PrimaryButton
              title={t('start')}
              onPress={handleStartPuja}
              style={styles.button}
            />
          </View>
        )}
        {bookingStatus == 'in_progress' && (
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={t('complete_puja')}
              onPress={handleCompletePuja}
              style={styles.button}
            />
          </View>
        )}
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
        panditItems={getPanditArrangedItems()}
        userItems={getUserArrangedItems()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(24),
    marginHorizontal: moderateScale(24),
    marginBottom: moderateScale(16),
    marginTop: moderateScale(8),
  },
  button: {
    flex: 1,
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfoContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: COLORS.separatorColor,
  },
  paymentInfoText: {
    fontSize: moderateScale(13),
    color: COLORS.primaryTextDark,
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
  },
});

export default PujaDetailsScreen;
