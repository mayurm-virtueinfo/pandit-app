import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useTranslation} from 'react-i18next';
import {apiService} from '../../api/apiService';
import {useNavigation} from '@react-navigation/native';
import {HomeStackParamList} from '../../navigation/HomeStack/HomeStack';

const {width: screenWidth} = Dimensions.get('window');

interface PujaItem {
  id: string | number;
  name: string;
  date?: string;
  image?: string;
}

const HomeScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<HomeStackParamList>();

  const [upcomingPujas, setUpcomingPujas] = useState<PujaItem[]>([]);
  const [completedPujas, setCompletedPujas] = useState<PujaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPujaList = async () => {
      setLoading(true);
      try {
        // The API returns an array of objects, but the actual data is a single object with arrays
        const pujaList = await apiService.getPujaList();
        console.log('pujaList', pujaList);

        // If the API returns an array, take the first element (as per the provided data structure)
        let data = Array.isArray(pujaList) ? pujaList[0] : pujaList;

        // Defensive fallback if data is not present
        if (!data) {
          setUpcomingPujas([]);
          setCompletedPujas([]);
        } else {
          setUpcomingPujas(
            Array.isArray(data.upcomingPujas) ? data.upcomingPujas : [],
          );
          setCompletedPujas(
            Array.isArray(data.completedPujas) ? data.completedPujas : [],
          );
        }
      } catch (error) {
        setUpcomingPujas([]);
        setCompletedPujas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPujaList();
  }, []);

  const renderPujaItem = (item: PujaItem, isLast: boolean) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => navigation.navigate('PujaDetailsScreen')}>
      <View style={styles.pujaItem}>
        <Image source={{uri: item.image}} style={styles.pujaImage} />
        <View style={styles.pujaContent}>
          <Text style={styles.pujaName}>{item.name}</Text>
          <Text style={styles.pujaDate}>{item.date}</Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Custom Header */}
      <UserCustomHeader
        title={t('home')}
        showBellButton={true}
        onNotificationPress={() => navigation.navigate('NotificationScreen')}
      />

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={COLORS.primaryTextDark} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Upcoming Puja's Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('upcoming_puja')}</Text>
              <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                {upcomingPujas.length === 0 ? (
                  <Text
                    style={{
                      color: COLORS.pujaCardSubtext,
                      textAlign: 'center',
                      padding: 10,
                    }}>
                    {t('no_upcoming_puja')}
                  </Text>
                ) : (
                  upcomingPujas.map((item, index) =>
                    renderPujaItem(item, index === upcomingPujas.length - 1),
                  )
                )}
              </View>
            </View>

            {/* Completed Puja's Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('completed_puja')}</Text>
              <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                {completedPujas.length === 0 ? (
                  <Text
                    style={{
                      color: COLORS.pujaCardSubtext,
                      textAlign: 'center',
                      padding: 10,
                    }}>
                    {t('no_completed_puja')}
                  </Text>
                ) : (
                  completedPujas.map((item, index) =>
                    renderPujaItem(item, index === completedPujas.length - 1),
                  )
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.pujaBackground,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(24),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(12),
    fontWeight: '600',
  },
  pujaCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    width: '100%',
  },
  pujaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(2),
  },
  pujaImage: {
    width: moderateScale(52),
    height: moderateScale(50),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(12),
    resizeMode: 'cover',
  },
  pujaContent: {
    flex: 1,
    justifyContent: 'center',
  },
  pujaName: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    fontWeight: '600',
    letterSpacing: -0.33,
    lineHeight: moderateScale(20),
  },
  pujaDate: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.pujaCardSubtext,
    fontWeight: '500',
    marginTop: verticalScale(4),
    lineHeight: moderateScale(18),
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginVertical: verticalScale(13),
    marginHorizontal: 0,
  },
  bottomPadding: {
    height: verticalScale(100),
  },
});

export default HomeScreen;
