import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import Fonts from '../../theme/fonts';
import UserCustomHeader from '../../components/CustomHeader';
import {useAuth} from '../../provider/AuthProvider';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import {moderateScale} from 'react-native-size-matters';
import {ProfileStackParamList} from '../../navigation/ProfileStack/ProfileStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../../utils/AppContent';
import {postLogout} from '../../api/apiService';

type ProfileFieldProps = {
  label: string;
  value: string;
};

const ProfileField: React.FC<ProfileFieldProps> = ({label, value}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const ProfileScreen = () => {
  const inset = useSafeAreaInsets();
  const navigation = useNavigation<ProfileStackParamList>();
  const {t, i18n} = useTranslation();
  const {signOutApp} = useAuth();

  const handleWalletNavigation = () => {
    navigation.navigate('EarningsHistoryScreen');
  };
  const handleNotificationNavigation = () => {
    navigation.navigate('NotificationScreen');
  };
  const handleEditNavigation = () => {
    navigation.navigate('CompleteProfileScreen');
  };
  const handlePastPujaNavigation = () => {
    navigation.navigate('PastPujaScreen');
  };
  const handleLogout = async () => {
    try {
      const refreshToken =
        (await AsyncStorage.getItem(AppConstant.REFRESH_TOKEN)) || '';
      console.log('refreshToken', refreshToken);
      const params = {
        refresh_token: refreshToken,
      };
      console.log(params);
      const response: any = await postLogout(params);
      if (response.data.success) {
        signOutApp();
      }
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };
  const userData = {
    name: 'Rajesh Sharma',
    email: 'rajeshsharma@gmail.com',
    phone: '90909 09090',
    location: 'Ahmedabad',
  };

  return (
    <SafeAreaView style={[styles.container, {paddingTop: inset.top}]}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={[styles.headerGradient]}
      />
      <UserCustomHeader title={t('profile')} showBackButton={true} />

      <View style={styles.profileImageContainer}>
        <Image
          source={{
            uri: 'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D',
          }}
          style={styles.profileImage}
        />
      </View>
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}>
          <View style={[styles.infoSection, THEMESHADOW.shadow]}>
            <ProfileField label={t('name')} value={userData.name} />
            <View style={styles.divider} />
            <ProfileField label={t('email')} value={userData.email} />
            <View style={styles.divider} />
            <ProfileField label={t('phone')} value={userData.phone} />
            <View style={styles.divider} />
            <ProfileField label={t('location')} value={userData.location} />
          </View>
          <View style={[styles.editSection, THEMESHADOW.shadow]}>
            <TouchableOpacity
              style={styles.editFieldContainer}
              onPress={handleEditNavigation}
              activeOpacity={0.7}>
              <Text style={styles.editFieldLabel}>{t('edit_profile')} </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primaryTextDark}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.editFieldContainer}
              onPress={handlePastPujaNavigation}>
              <Text style={styles.editFieldLabel}>{t('past_puja')} </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primaryTextDark}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.editFieldContainer}
              onPress={handleWalletNavigation}
              activeOpacity={0.7}>
              <Text style={styles.editFieldLabel}>{t('earnings_history')}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primaryTextDark}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.editFieldContainer}
              onPress={handleNotificationNavigation}
              activeOpacity={0.7}>
              <Text style={styles.editFieldLabel}>{t('notifications')} </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primaryTextDark}
              />
            </TouchableOpacity>
          </View>

          {/* <LanguageSwitcher /> */}
          <TouchableOpacity
            style={[styles.editSection, THEMESHADOW.shadow]}
            onPress={handleLogout}>
            <View style={styles.editFieldContainer}>
              <Text style={styles.logoutLabel}>{t('logout')}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primaryTextDark}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 184,
    // backgroundColor: COLORS.primaryBackground,
  },
  profileImageContainer: {
    position: 'absolute',
    top: 105,
    alignSelf: 'center',
    zIndex: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.pujaBackground,
  },
  contentContainer: {
    position: 'absolute',
    top: 153,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.backgroundPrimary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 64,
    paddingBottom: 24,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  infoSection: {
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    marginTop: 10,
    // shadow styles removed, now handled by THEMESHADOW
  },
  editSection: {
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    // shadow styles removed, now handled by THEMESHADOW
  },
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  fieldLabel: {
    color: COLORS.inputLabelText,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    flex: 1,
    paddingVertical: 5,
  },
  fieldValue: {
    color: COLORS.textPrimary,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    textAlign: 'right',
    flex: 2,
  },
  editFieldContainer: {
    minHeight: 34,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  editFieldLabel: {
    color: COLORS.textPrimary,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    paddingVertical: 5,
  },
  logoutLabel: {
    color: COLORS.gradientEnd,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginVertical: 8,
  },
});

export default ProfileScreen;
