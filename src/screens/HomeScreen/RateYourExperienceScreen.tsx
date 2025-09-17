import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import ImagePicker from 'react-native-image-crop-picker';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {HomeStackParamList} from '../../navigation/HomeStack/HomeStack';
import {COLORS} from '../../theme/theme';
import CustomHeader from '../../components/CustomHeader';
import PrimaryButton from '../../components/PrimaryButton';
import Fonts from '../../theme/fonts';

// Import the postRateUser API and postReviewImageUpload
import {
  postRateUser,
  getCompletedPuja,
  postReviewImageUpload,
} from '../../api/apiService';
import {useCommonToast} from '../../common/CommonToast';
import CustomeLoader from '../../components/CustomLoader';

const RateYourExperienceScreen: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pujaDetail, setPujaDetail] = useState<any>(null);
  const [pujaLoading, setPujaLoading] = useState<boolean>(true);

  type ScreenNavigationProp = StackNavigationProp<
    HomeStackParamList,
    'RateYourExperienceScreen'
  >;
  const {t} = useTranslation();
  const {showErrorToast, showSuccessToast} = useCommonToast();
  const inset = useSafeAreaInsets();
  const route = useRoute();
  const {bookingId} = route.params as any;
  const navigation = useNavigation<ScreenNavigationProp>();

  useEffect(() => {
    const fetchPujaDetail = async () => {
      try {
        setPujaLoading(true);
        // Call getCompletedPuja API for puja detail
        const response = await getCompletedPuja();
        const data = response?.data;

        // Find the puja detail that matches the bookingId
        // bookingId may be string or number, so use loose equality
        const foundPuja = Array.isArray(data)
          ? data.find((item: any) => item.id == bookingId)
          : null;

        setPujaDetail(foundPuja || null);
      } catch (error: any) {
        showErrorToast(
          error?.response?.data?.message || t('something_went_wrong'),
        );
        setPujaDetail(null);
      } finally {
        setPujaLoading(false);
      }
    };
    if (bookingId) {
      fetchPujaDetail();
    }
  }, [bookingId]);

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  // Add multiple photos handler using react-native-image-crop-picker
  const handleAddPhotos = async () => {
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        maxFiles: 10 - photos.length,
        compressImageQuality: 0.8,
        cropping: false,
      });
      let selectedImages = Array.isArray(images) ? images : [images];
      const formatted = selectedImages.map(img => ({
        uri: Platform.OS === 'ios' ? img.sourceURL || img.path : img.path,
        mime: img.mime,
        width: img.width,
        height: img.height,
        size: img.size,
      }));
      setPhotos(prev => [...prev, ...formatted].slice(0, 10));
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.error('Failed to pick images:', error);
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Call postRateUser API for rating, and upload images using postReviewImageUpload
  const handleSubmit = async () => {
    if (rating === 0) {
      showErrorToast(t('please_give_rating') || 'Please give a rating');
      return;
    }
    try {
      setLoading(true);
      // Get booking id from pujaDetail or params
      const bookingIdToSend = pujaDetail?.id || bookingId;
      const ratingValue = rating;
      const reviewText = feedback;

      let uploadedPhotoUrls: string[] = [];

      if (photos.length > 0) {
        // Upload each photo using postReviewImageUpload
        // Assume postReviewImageUpload returns { url: string }
        const uploadPromises = photos.map(async photo => {
          // Prepare FormData for each image
          const formData = new FormData();
          formData.append('images', {
            uri: photo.uri,
            type: photo.mime,
            name: `review_photo_${Date.now()}.${
              photo.mime?.split('/')[1] || 'jpg'
            }`,
          });
          // Call the API
          const res = await postReviewImageUpload(formData, bookingIdToSend);
          // Support both {url} and {data: {url}}
          if (res?.url) return res.url;
          if (res?.data?.url) return res.data.url;
          return null;
        });

        const results = await Promise.all(uploadPromises);
        uploadedPhotoUrls = results.filter(Boolean) as string[];
      }

      // Prepare payload for postRateUser
      const payload: any = {
        booking: bookingIdToSend,
        rating: ratingValue,
        review: reviewText,
        photos: photos,
      };

      await postRateUser(payload);

      setRating(0);
      setFeedback('');
      setPhotos([]);
      showSuccessToast(t('rate_submit_successfully'));
      navigation.replace('HomeScreen');
    } catch (error: any) {
      showErrorToast(
        error?.response?.data?.message || t('something_went_wrong'),
      );
      console.error('Failed to submit rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStar = (index: number) => {
    const isFilled = index < rating;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(index)}
        style={styles.starButton}>
        <Icon
          name="star"
          size={36}
          color={
            isFilled ? COLORS.primaryBackgroundButton : COLORS.bottomNavIcon
          }
        />
      </TouchableOpacity>
    );
  };

  // Extract pooja image and name from pujaDetail for the card
  const poojaImage =
    pujaDetail?.booking_user_img ||
    'https://cdn.builder.io/api/v1/image/assets/TEMP/db9492299c701c6ca2a23d6de9fc258e7ec2b5fd?width=160';

  const poojaName = pujaDetail?.pooja_name || 'For family well-being';
  const poojaDate = pujaDetail?.booking_date
    ? `Date: ${pujaDetail.booking_date}`
    : '';

  return (
    <View style={[styles.container, {paddingTop: inset.top}]}>
      <CustomHeader title={t('rate_experience')} showBackButton={true} />

      {(pujaLoading || loading) && (
        <View style={{flex: 1, backgroundColor: COLORS.white}}>
          <CustomeLoader loading={loading} />
        </View>
      )}
      {!pujaLoading && !loading && (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.mainContent}>
            {/* Puja Details Card */}
            <View style={styles.panditCard}>
              <View style={styles.panditImageContainer}>
                <Image
                  source={{
                    uri: poojaImage,
                  }}
                  style={styles.panditImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.panditInfo}>
                <Text style={styles.panditName}>
                  {pujaDetail?.booking_user_name ||
                    pujaDetail?.pandit_name ||
                    pujaDetail?.manual_pandit_name ||
                    ''}
                </Text>
                <Text style={styles.panditPurpose}>{poojaName}</Text>
                <Text style={styles.panditPurpose}>{poojaDate}</Text>
                {/* <PrimaryButton
                  title={t('view_details')}
                  onPress={() =>
                    navigation.navigate('PujaDetailsScreen', {
                      id: pujaDetail?.id,
                    })
                  }
                  style={styles.viewDetailsButton}
                  textStyle={styles.viewDetailsText}
                /> */}
              </View>
            </View>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>
                {t('how_was_your_experience')}
              </Text>
              <View style={styles.ratingCard}>
                <View style={styles.starsContainer}>
                  {[0, 1, 2, 3, 4].map(renderStar)}
                </View>
              </View>
            </View>

            {/* Add multiple photos */}
            <View style={styles.photoSection}>
              <Text style={styles.photoSectionTitle}>
                {t('add_photos_optional') || 'Add Photos (optional)'}
              </Text>
              <View style={styles.photoList}>
                {photos.map((photo, idx) => (
                  <View key={idx} style={styles.photoItem}>
                    <Image
                      source={{uri: photo.uri}}
                      style={styles.photoImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => handleRemovePhoto(idx)}>
                      <AntDesign
                        name="closecircle"
                        size={20}
                        color={COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addPhotoBtn}
                  onPress={handleAddPhotos}>
                  <AntDesign
                    name="pluscircleo"
                    size={32}
                    color={COLORS.primary}
                  />
                  <Text style={styles.addPhotoText}>
                    {t('add_photo') || 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Feedback Section */}
            <View>
              <TextInput
                style={styles.feedbackInput}
                placeholder={t('tell_us_more_about_your_experience')}
                placeholderTextColor="rgba(25, 19, 19, 0.3)"
                multiline
                numberOfLines={4}
                value={feedback}
                onChangeText={setFeedback}
                textAlignVertical="top"
              />
            </View>

            <PrimaryButton
              title={t('submtt_rating') || 'Submit Review'}
              onPress={handleSubmit}
              style={styles.buttonContainer}
              textStyle={styles.buttonText}
              disabled={loading}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.pujaBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  mainContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
    gap: verticalScale(16),
  },
  panditCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: scale(16),
    alignItems: 'center',
    marginHorizontal: scale(4),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panditImageContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  panditImage: {
    width: '100%',
    height: '100%',
  },
  panditInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  panditName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: Fonts.Sen_SemiBold,
    marginBottom: verticalScale(4),
  },
  panditPurpose: {
    color: COLORS.pujaCardSubtext,
    fontSize: 13,
    fontFamily: Fonts.Sen_Medium,
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    height: 30,
    marginTop: 12,
  },
  viewDetailsText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: Fonts.Sen_Regular,
  },
  ratingSection: {
    gap: verticalScale(12),
    marginTop: 10,
  },
  ratingTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: Fonts.Sen_SemiBold,
    paddingHorizontal: scale(4),
  },
  ratingCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingVertical: 10,
    paddingHorizontal: scale(20),
    alignItems: 'center',
    marginHorizontal: scale(4),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    padding: scale(8),
    minWidth: scale(44),
    minHeight: scale(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackInput: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: scale(16),
    minHeight: verticalScale(100),
    maxHeight: verticalScale(150),
    color: COLORS.textPrimary,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    marginHorizontal: scale(4),
    marginTop: 8,
  },
  photoSection: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
  },
  photoSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
    marginBottom: verticalScale(6),
    marginLeft: scale(4),
  },
  photoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: scale(8),
  },
  photoItem: {
    position: 'relative',
    marginRight: scale(8),
    marginBottom: scale(8),
  },
  photoImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(8),
    backgroundColor: COLORS.pujaCardSubtext,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    zIndex: 2,
  },
  addPhotoBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: COLORS.white,
  },
  addPhotoText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: Fonts.Sen_Regular,
    marginTop: 2,
  },
  buttonContainer: {
    height: 46,
    marginTop: verticalScale(12),
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
  },
});

export default RateYourExperienceScreen;
