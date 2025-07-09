import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import UserCustomHeader from '../../components/CustomHeader';
import {Images} from '../../theme/Images';
import PrimaryButton from '../../components/PrimaryButton';
import {COLORS} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {HomeStackParamList} from '../../navigation/HomeStack/HomeStack';

const PujaSuccessfullScreen: React.FC = () => {
  type ScreenNavigationProps = StackNavigationProp<
    HomeStackParamList,
    'HomeScreen'
  >;
  const {t, i18n} = useTranslation();

  const inset = useSafeAreaInsets();

  const navigation = useNavigation<ScreenNavigationProps>();

  return (
    <SafeAreaView style={[styles.safeArea, {paddingTop: inset.top}]}>
      <StatusBar barStyle="light-content" />
      <UserCustomHeader title={t('puja_completed')} />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          <View style={styles.detailsContainer}>
            <Image
              source={Images.ic_booking_success}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.successText}>
              {t('puja_completed_successfully')}
            </Text>
            <PrimaryButton
              title={t('go_to_home')}
              onPress={() => navigation.navigate('HomeScreen')}
              style={styles.buttonContainer}
              textStyle={styles.buttonText}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PujaSuccessfullScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  scrollContainer: {
    flexGrow: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  image: {
    width: 260,
    height: 177,
    alignSelf: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  buttonContainer: {
    height: 46,
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
    textAlign: 'center',
  },
});
