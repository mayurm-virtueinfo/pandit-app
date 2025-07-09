import {
  useNavigation,
  useNavigationState,
  useRoute,
  DrawerActions,
} from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../theme/theme';
import Fonts from '../theme/fonts';
import {useTranslation} from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';

interface UserCustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showBellButton?: boolean;
  showCirclePlusButton?: boolean;
  showCallButton?: boolean;
  showSliderButton?: boolean;
  showSkipButton?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  onCirclePlusPress?: () => void;
}

const UserCustomHeader: React.FC<UserCustomHeaderProps> = ({
  title = '',
  showBackButton = false,
  showMenuButton = false,
  showBellButton = false,
  showCirclePlusButton = false,
  showCallButton = false,
  showSliderButton = false,
  showSkipButton = false,
  onBackPress,
  onNotificationPress,
  onCirclePlusPress,
}) => {
  const {t, i18n} = useTranslation();
  const navigation = useNavigation();
  const inset = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      console.log('Notification pressed');
    }
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={[
          styles.gradientContainer,
          // {paddingTop: Platform.OS === 'android' ? inset.top : 0},
          // {height: Platform.OS === 'ios' ? 50 : 100},
        ]}>
        {/* Header Content */}
        <View style={styles.headerContainer}>
          <View style={styles.leftContainer}>
            {showBackButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                style={styles.iconButton}>
                <Ionicons name="chevron-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
            )}
            {showMenuButton && (
              <TouchableOpacity
                onPress={() =>
                  navigation.dispatch(DrawerActions.toggleDrawer())
                }
                style={styles.iconButton}>
                <Ionicons name="menu" size={24} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>

          <View style={styles.rightContainer}>
            {showBellButton && (
              <TouchableOpacity
                onPress={handleNotificationPress}
                style={styles.iconButton}>
                <MaterialIcons
                  name="notifications"
                  size={24}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            )}
            {showCirclePlusButton && (
              <TouchableOpacity
                onPress={() =>
                  onCirclePlusPress
                    ? onCirclePlusPress()
                    : console.log('Plus Icon pressed')
                }
                style={styles.iconButton}>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            )}
            {showCallButton && (
              <TouchableOpacity
                onPress={() => console.log('Call Icon pressed')}
                style={styles.iconButton}>
                <Ionicons name="call-outline" size={24} color={COLORS.white} />
              </TouchableOpacity>
            )}
            {showSliderButton && (
              <TouchableOpacity
                onPress={() => console.log('Slider Icon pressed')}
                style={styles.iconButton}>
                <Feather
                  name="sliders"
                  size={24}
                  color={COLORS.white}
                  style={{transform: [{rotate: '270deg'}]}}
                />
              </TouchableOpacity>
            )}
            {showSkipButton && (
              <TouchableOpacity
                onPress={() => console.log('Call Icon pressed')}
                style={styles.iconButton}>
                <Text style={styles.skipButton}>{t('skip')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    // height: 100,
  },
  statusBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 12,
    paddingBottom: 12,
    height: 44,
  },
  timeText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: Fonts.Sen_Regular,
    letterSpacing: -0.23,
  },
  statusIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    height: 56,
    marginTop: -5,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  titleText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: Fonts.Sen_Bold,
    textAlign: 'center',
  },
  iconButton: {
    padding: 4,
  },
  skipButton: {
    fontSize: 14,
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.white,
  },
});

export default UserCustomHeader;
