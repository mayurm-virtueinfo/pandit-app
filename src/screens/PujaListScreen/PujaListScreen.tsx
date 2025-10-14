import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {useTranslation} from 'react-i18next';
import {getPuja} from '../../api/apiService';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {PujaListStackParamList} from '../../navigation/PujaListStack/PujaListStack';
import CustomeLoader from '../../components/CustomLoader';

type PujaListScreenNavigationProp = StackNavigationProp<
  PujaListStackParamList,
  'PujaListScreen'
>;

interface PujaItemType {
  id: number;
  pooja: number;
  pooja_image_url: string;
  pooja_title: string;
  pooja_short_description: string;
  price_with_samagri: string;
  price_without_samagri: string;
  price_status: number;
  system_price: {
    price_with_samagri: number;
    price_without_samagri: number;
  };
}

interface PujaItemProps {
  puja: PujaItemType;
  onEdit: (puja: PujaItemType) => void;
}

const PujaListScreen: React.FC = () => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PujaListScreenNavigationProp>();
  const [pujaList, setPujaList] = useState<PujaItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPujaList = async () => {
    setLoading(true);
    try {
      const response: any = await getPuja();

      if (response.data.success) {
        const data = response.data.data;
        console.log('data', data);
        const mapped = data.map((item: any) => ({
          id: item.id,
          pooja: item.pooja,
          pooja_image_url: item.pooja_image_url,
          pooja_title: item.pooja_title,
          pooja_short_description: item.pooja_short_description,
          price_with_samagri: item.price_with_samagri,
          price_without_samagri: item.price_without_samagri,
          price_status: item.price_status,
          system_price: item.system_price,
        }));
        setPujaList(mapped);
      }
    } catch (error) {
      setPujaList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPujaList();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPujaList();
    }, []),
  );

  const PujaItem: React.FC<PujaItemProps> = ({puja, onEdit}) => {
    const formattedPriceWith =
      puja.price_with_samagri && puja.price_with_samagri !== '0.00'
        ? `₹ ${Number(puja.price_with_samagri).toLocaleString('en-IN')}`
        : '₹ 0';
    const formattedPriceWithout =
      puja.price_without_samagri && puja.price_without_samagri !== '0.00'
        ? `₹ ${Number(puja.price_without_samagri).toLocaleString('en-IN')}`
        : '₹ 0';

    return (
      <View style={styles.pujaItemContainer}>
        <View style={styles.pujaContent}>
          {puja.pooja_image_url ? (
            <Image
              source={{uri: puja.pooja_image_url}}
              style={styles.pujaImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.pujaImagePlaceholder} />
          )}
          <View style={styles.pujaTextContainer}>
            <Text style={styles.pujaName}>{puja.pooja_title}</Text>
            <Text style={styles.pujaDescription}>
              {puja.pooja_short_description}
            </Text>
            <View style={styles.priceAndEditContainer}>
              <Text style={styles.pujaPrice}>{formattedPriceWith}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(puja)}>
                <Text style={styles.editButtonText}>{t('edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleEditPuja = (puja: PujaItemType) => {
    navigation.navigate('EditPujaScreen', {pujaId: puja.id, pujaData: puja});
  };

  const handleAddPuja = () => {
    navigation.navigate('AddPujaScreen');
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CustomeLoader loading={loading} />
      <UserCustomHeader
        title={t('puja_list')}
        showCirclePlusButton={true}
        onCirclePlusPress={handleAddPuja}
      />
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Platform.OS === 'ios' ? 20 : 50,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.listContainer, THEMESHADOW.shadow]}>
            {loading ? null : pujaList.length === 0 ? (
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
    </View>
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
    paddingBottom: 20,
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
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginRight: 14,
  },
  pujaImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginRight: 14,
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
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pujaPrice: {
    color: COLORS.primary,
    fontSize: 18,
    fontFamily: Fonts.Sen_SemiBold,
    fontWeight: '600',
  },
  priceLabel: {
    color: COLORS.pujaCardSubtext,
    fontSize: 13,
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
  },
  priceValue: {
    color: COLORS.primaryTextDark,
    fontSize: 13,
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
  },
  priceAndEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
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
