import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {useTranslation} from 'react-i18next';
import {apiService, PujaListItemType} from '../../api/apiService';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {PujaListStackParamList} from '../../navigation/PujaListStack/PujaListStack';

type PujaListScreenNavigationProp = StackNavigationProp<
  PujaListStackParamList,
  'PujaListScreen'
>;

interface PujaItemProps {
  puja: PujaListItemType;
  onEdit: (id: number) => void;
}

const PujaListScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<PujaListScreenNavigationProp>();
  const [pujaList, setPujaList] = useState<PujaListItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPujaList();
  }, []);

  const fetchPujaList = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPujaListData();
      setPujaList(response.pujaList || []);
    } catch (error) {
      setPujaList([]);
    } finally {
      setLoading(false);
    }
  };

  const PujaItem: React.FC<PujaItemProps> = ({puja, onEdit}) => {
    // Price formatting: show as ₹ <amount>
    const formattedPrice =
      typeof puja.price === 'number'
        ? `₹ ${puja.price.toLocaleString('en-IN')}`
        : puja.price;

    return (
      <View style={styles.pujaItemContainer}>
        <View style={styles.pujaContent}>
          <Image source={{uri: puja.image}} style={styles.pujaImage} />
          <View style={styles.pujaTextContainer}>
            <Text style={styles.pujaName}>{puja.name}</Text>
            <Text style={styles.pujaDescription}>{puja.pujaPurpose}</Text>
            <View style={styles.priceAndEditContainer}>
              <Text style={styles.pujaPrice}>{formattedPrice}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(puja.id)}>
                <Text style={styles.editButtonText}>{t('edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleEditPuja = (pujaId: number) => {
    console.log('Edit puja with ID:', pujaId);
    // Navigate to edit screen or show edit modal
  };

  const handleAddPuja = () => {
    navigation.navigate('AddPujaScreen');
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      <UserCustomHeader
        title={t('puja_list')}
        showCirclePlusButton={true}
        onCirclePlusPress={handleAddPuja}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.listContainer, THEMESHADOW.shadow]}>
            {loading ? (
              <View style={{alignItems: 'center', marginTop: 40}}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : pujaList.length === 0 ? (
              <Text
                style={{
                  textAlign: 'center',
                  color: COLORS.primaryTextDark,
                  marginVertical: 30,
                }}>
                {t('no_items_found')}
              </Text>
            ) : (
              pujaList.map((puja, index) => (
                <View key={puja.id}>
                  <PujaItem puja={puja} onEdit={handleEditPuja} />
                  {index < pujaList.length - 1 && renderSeparator()}
                </View>
              ))
            )}
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
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  pujaItemContainer: {
    paddingVertical: 0,
  },
  pujaContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  pujaImage: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: COLORS.lightGray,
  },
  pujaTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  pujaName: {
    color: COLORS.primaryTextDark,
    fontSize: 15,
    fontFamily: Fonts.Sen_SemiBold,
    fontWeight: '600',
    letterSpacing: -0.33,
    marginBottom: 6,
  },
  pujaDescription: {
    color: COLORS.pujaCardSubtext,
    fontSize: 13,
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
    marginBottom: 10,
  },
  priceAndEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pujaPrice: {
    color: COLORS.primary,
    fontSize: 18,
    fontFamily: Fonts.Sen_SemiBold,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: COLORS.primaryBackgroundButton,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 17,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: COLORS.primaryTextDark,
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: -0.15,
    lineHeight: 21,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginVertical: 13,
  },
});

export default PujaListScreen;
