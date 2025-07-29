import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS, wp, hp, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {moderateScale} from 'react-native-size-matters';
import {useTranslation} from 'react-i18next';

interface SettingItemProps {
  title: string;
  onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({title, onPress}) => {
  return (
    <>
      <TouchableOpacity style={styles.settingItem} onPress={onPress}>
        <Text style={styles.settingText}>{title}</Text>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={24}
          color={COLORS.primaryTextDark}
        />
      </TouchableOpacity>
      <View style={styles.separator} />
    </>
  );
};

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const inset = useSafeAreaInsets();
  const {t} = useTranslation();

  const handleSettingPress = (screenName: string) => {
    console.log(`${screenName} pressed`);
    // @ts-ignore
    navigation.navigate(screenName as never, {action: 'Update'} as never);
  };

  const settingsOptions = [
    {
      title: t('availability'),
      key: 'availability',
      navigation: 'AvailabilityScreen',
    },
    {
      title: t('service_city'),
      key: 'changeCity',
      navigation: 'EditCityScreen',
    },
    // {
    //   title: t('change_area'),
    //   key: 'changeArea',
    //   navigation: 'SelectAreaScreen',
    // },
    {
      title: t('change_puja'),
      key: 'changePuja',
      navigation: 'EditSelectedPooja',
    },
    {
      title: t('change_languages'),
      key: 'changeLanguages',
      navigation: 'EditPanditLanguageScreen',
    },
    {
      title: t('change_documents'),
      key: 'changeDocuments',
      navigation: 'EditPanditDocumentsScreen',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, {paddingTop: inset.top}]}>
      <StatusBar
        backgroundColor={COLORS.primaryBackground}
        barStyle="light-content"
      />
      <UserCustomHeader title={t('settings')} />

      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={[styles.settingsCard, THEMESHADOW.shadow]}>
            {settingsOptions.map((option, index) => (
              <SettingItem
                key={option.key}
                title={option.title}
                onPress={() => handleSettingPress(option.navigation)}
              />
            ))}
          </View>
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
  content: {
    flex: 1,
    backgroundColor: COLORS.pujaBackground,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: moderateScale(24),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
  },
  scrollContent: {
    paddingBottom: 100,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: moderateScale(14),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(14),
    minHeight: 48,
  },
  settingText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    letterSpacing: -0.333,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
  },
});

export default SettingsScreen;
