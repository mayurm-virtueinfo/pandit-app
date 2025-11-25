import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import Fonts from '../../theme/fonts';
import UserCustomHeader from '../../components/CustomHeader';
import { useAuth } from '../../provider/AuthProvider';
import { COLORS, THEMESHADOW } from '../../theme/theme';
import { moderateScale } from 'react-native-size-matters';
import { ProfileStackParamList } from '../../navigation/ProfileStack/ProfileStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../../utils/AppContent';
import CustomModal from '../../components/CustomModal';
import { getPanditProfileDetails, postLogout } from '../../api/apiService';
import { deleteAccount } from '../../api/apiService';
import { useCommonToast } from '../../common/CommonToast';
import CustomeLoader from '../../components/CustomLoader';
import { getFcmToken } from '../../configuration/notificationPermission';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { translateData } from '../../utils/TranslateData';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

type ProfileFieldProps = {
  label: string;
  value: string;
};

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const ProfileScreen = () => {
  const inset = useSafeAreaInsets();
  const navigation = useNavigation<ProfileStackParamList>();
  const { t, i18n } = useTranslation();
  const { signOutApp } = useAuth();
  const { showErrorToast, showSuccessToast } = useCommonToast();

  const currentLanguage = i18n.language;
  const translationCacheRef = useRef<Map<string, any>>(new Map());

  const [profileData, setProfileData] = React.useState<any>(null);
  const [originalProfileData, setOriginalProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  console.log('userId', userId);

  const getUserIdFromStorage = async () => {
    try {
      const id = await AsyncStorage.getItem(AppConstant.USER_ID);
      setUserId(id);
    } catch (error) {
      setUserId(null);
    }
  };

  console.log('profileData :: ', profileData);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleWalletNavigation = () => {
    navigation.navigate('EarningsHistoryScreen');
  };
  const handleEditNavigation = () => {
    navigation.navigate('EditProfileScreen');
  };
  const handlePastPujaNavigation = () => {
    navigation.navigate('PastPujaScreen');
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await notifee.cancelAllNotifications();
      const refreshToken =
        (await AsyncStorage.getItem(AppConstant.REFRESH_TOKEN)) || '';
      const fcmToken = await getFcmToken();

      try {
        await messaging().deleteToken();
      } catch (messagingError) {
        console.warn(
          'Unable to delete FCM token during logout, proceeding anyway',
          messagingError,
        );
      }

      const params = {
        refresh_token: refreshToken,
        device_token: fcmToken,
        user_id: userId,
      };
      const response: any = await postLogout(params);
      if (response.data.success) {
        signOutApp();
      }
    } catch (error: any) {
      console.error('Logout error:', error?.response);
    }
    setLogoutLoading(false);
  };

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      // ✅ Check cache first
      const cachedData = translationCacheRef.current.get(currentLanguage);
      if (cachedData) {
        setProfileData(cachedData);
        return;
      }

      // 🧾 Fetch profile API
      const response: any = await getPanditProfileDetails();
      const data = response?.data?.data;

      if (!data) throw new Error('No profile data found');

      setOriginalProfileData(data);

      // 🌍 Translate dynamic fields
      const translatedProfile = await translateData(data, currentLanguage, [
        'pandit_name',
        'pandit_email',
        'address_city_name',
      ]);

      // 💾 Cache translated result
      translationCacheRef.current.set(currentLanguage, translatedProfile);

      // 📲 Update UI
      setProfileData(translatedProfile);
    } catch (error: any) {
      console.error('Profile data fetch error:', error);
      showErrorToast(error?.message || 'Failed to fetch profile data');
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    // Get user_id from AsyncStorage instead of profileData
    console.log('id', userId);
    let id = userId;
    console.log('id::::', id);
    if (!id) {
      try {
        id = await AsyncStorage.getItem(AppConstant.USER_ID);
        setUserId(id);
      } catch (error) {
        id = null;
      }
    }
    if (!id) {
      showErrorToast('User ID not found');
      return;
    }
    // Convert id to number before passing to API
    const numericId = Number(id);
    if (isNaN(numericId)) {
      showErrorToast('User ID is not a valid number');
      return;
    }
    setDeleteLoading(true);
    try {
      await notifee.cancelAllNotifications();
      try {
        await messaging().deleteToken();
      } catch (messagingError) {
        console.warn(
          'Unable to delete FCM token during account deletion, proceeding anyway',
          messagingError,
        );
      }

      // Only pass user_id as number, remove all other tokens/ids
      const params = { user_id: numericId };
      const response: any = await deleteAccount(params);
      console.log('response', response);
      if (response?.data?.success) {
        setDeleteModalVisible(false);
        showSuccessToast(
          t('account_deleted_successfully') || 'Account deleted successfully',
        );
        // Sign out and clear storage
        signOutApp();
        navigation.replace('Auth');
      } else {
        showErrorToast(
          response?.data?.message ||
            t('delete_account_failed') ||
            'Failed to delete account',
        );
      }
    } catch (error: any) {
      showErrorToast(
        error?.response?.data?.message ||
          error?.message ||
          t('delete_account_failed') ||
          'Failed to delete account',
      );
    }
    setDeleteLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      translationCacheRef.current.delete(currentLanguage);
      fetchProfileData();
      getUserIdFromStorage();
    }, [fetchProfileData, currentLanguage]),
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: inset.top }]}>
      <CustomeLoader loading={isLoading || deleteLoading} />
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={[styles.headerGradient]}
      />
      <UserCustomHeader title={t('profile')} />

      <View style={styles.profileImageContainer}>
        <Image
          source={{
            uri:
              profileData?.profile_img ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy3IRQZYt7VgvYzxEqdhs8R6gNE6cYdeJueyHS-Es3MXb9XVRQQmIq7tI0grb8GTlzBRU&usqp=CAU',
          }}
          style={styles.profileImage}
        />
      </View>
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {profileData && (
            <View style={[styles.infoSection, THEMESHADOW.shadow]}>
              <ProfileField label={t('name')} value={profileData.pandit_name} />
              <View style={styles.divider} />
              <ProfileField
                label={t('email')}
                value={profileData.pandit_email}
              />
              <View style={styles.divider} />
              <ProfileField
                label={t('phone')}
                value={profileData.pandit_mobile}
              />
              <View style={styles.divider} />
              <ProfileField
                label={t('location')}
                value={profileData.address_city_name}
              />
            </View>
          )}
          <View style={[styles.editSection, THEMESHADOW.shadow]}>
            <TouchableOpacity
              style={styles.editFieldContainer}
              onPress={handleEditNavigation}
              activeOpacity={0.7}
            >
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
              onPress={handlePastPujaNavigation}
            >
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
              activeOpacity={0.7}
            >
              <Text style={styles.editFieldLabel}>{t('earnings_history')}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primaryTextDark}
              />
            </TouchableOpacity>
            {/* <View style={styles.divider} />
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
            </TouchableOpacity> */}
          </View>

          <LanguageSwitcher />

          <TouchableOpacity
            style={[styles.editSection, THEMESHADOW.shadow]}
            onPress={() => setLogoutModalVisible(true)}
          >
            <View style={styles.editFieldContainer}>
              <Text style={styles.logoutLabel}>{t('logout')}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primaryTextDark}
              />
            </View>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={[styles.deleteSection, THEMESHADOW.shadow]}
            onPress={() => setDeleteModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.editFieldContainer}>
              <Text style={styles.deleteLabel}>
                {t('delete_account') || 'Delete Account'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.error || '#FF3B30'}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <CustomModal
        visible={logoutModalVisible}
        title={t('logout')}
        message={t('are_you_sure_logout')}
        confirmText={logoutLoading ? t('logging_out') : t('lo')}
        cancelText={t('cancel')}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
      {/* Delete Account Modal */}
      <CustomModal
        visible={deleteModalVisible}
        title={t('delete_account') || 'Delete Account'}
        message={
          t('are_you_sure_delete_account') ||
          'Are you sure you want to delete your account? This action cannot be undone.'
        }
        confirmText={
          deleteLoading
            ? t('deleting') || 'Deleting...'
            : t('delete') || 'Delete'
        }
        cancelText={t('cancel')}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalVisible(false)}
      />
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
    borderWidth: 1,
    borderColor: COLORS.white,
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
  },
  editSection: {
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.white,
  },
  deleteSection: {
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.white,
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
  deleteLabel: {
    color: COLORS.error || '#FF3B30',
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
