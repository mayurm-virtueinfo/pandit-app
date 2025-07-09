import React, {useState, useEffect} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
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
import {apiService, pujaDetails as PujaDetailsType} from '../../api/apiService';

const {width: screenWidth} = Dimensions.get('window');

const PujaDetailsScreen = ({navigation}: {navigation?: any}) => {
  const {t} = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pujaStarted, setPujaStarted] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [isPujaItemsModalVisible, setIsPujaItemsModalVisible] = useState(false);
  const [pujaDetails, setPujaDetails] = useState<PujaDetailsType | null>(null);

  useEffect(() => {
    const fetchPujaDetails = async () => {
      try {
        const data = await apiService.getPujaDetailsData();
        if (data) {
          setPujaDetails(data.pujaDetails);
        }
      } catch (error) {
        console.error('Error fetching puja details:', error);
      }
    };
    fetchPujaDetails();
  }, []);

  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleStartPuja = () => {
    setIsModalVisible(true);
  };

  const handleCodeSubmit = () => {
    if (isModalVisible) {
      setIsModalVisible(false);
      setPujaStarted(true);
    }
    if (isCompleteModalVisible) {
      setIsCompleteModalVisible(false);
      setPujaStarted(false);
      navigation?.navigate('PujaSuccessfull');
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <UserCustomHeader
        title={pujaDetails?.name || 'Ganesh Puja'}
        showBackButton
        showBellButton
        onBackPress={handleBackPress}
        onNotificationPress={() => {}}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Image
            source={{
              uri: pujaDetails?.image,
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
            <Text style={styles.pujaTitle}>{pujaDetails?.name}</Text>

            <View style={[styles.detailsCard, THEMESHADOW.shadow]}>
              <View style={styles.detailItem}>
                <Octicons
                  name="location"
                  size={24}
                  color={COLORS.pujaCardSubtext}
                  style={styles.detailIcon}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailText}>{pujaDetails?.address}</Text>
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
                  <Text style={styles.detailText}>{pujaDetails?.date}</Text>
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
                  <Text style={styles.detailText}>{pujaDetails?.time}</Text>
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
                      uri: 'https://api.builder.io/api/v1/image/assets/TEMP/0dd21e4828d095d395d4c9eadfb3a0b6c7aee7bd?width=80',
                    }}
                    style={styles.priestImage}
                  />
                  <View style={styles.priestImageBorder} />
                </View>
                <Text style={styles.priestName}>{pujaDetails?.client}</Text>
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
                  {pujaDetails?.puja_item_type}
                </Text>
              </View>
              <Text style={styles.pricingAmount}>{pujaDetails?.pricing}</Text>
            </View>

            {!pujaStarted ? (
              <View style={styles.buttonContainer}>
                <PrimaryButtonOutlined
                  title={t('cancel')}
                  onPress={() => {}}
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
    </SafeAreaView>
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
