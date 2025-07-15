import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {useTranslation} from 'react-i18next';
import Octicons from 'react-native-vector-icons/Octicons';
import {
  putPuja,
  getUnassignPuja,
  EditRequest,
  postAddPuja,
  AddPuja,
  EditPuja,
} from '../../api/apiService';
import PrimaryButton from '../../components/PrimaryButton';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCommonToast} from '../../common/CommonToast';

interface PriceOption {
  id: 'system' | 'custom';
  title: string;
  description?: string;
}

type PujaDataType = {
  id: number;
  pooja: number;
  pooja_image_url: string;
  pooja_short_description: string;
  pooja_title: string;
  price_with_samagri: string;
  price_without_samagri: string;
  price_status: number;
};

const AddPujaScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {showErrorToast, showSuccessToast} = useCommonToast();
  const params = route.params as
    | {pujaId?: number; pujaData?: PujaDataType}
    | undefined;

  const {pujaId, pujaData} = params || {};
  const isEditMode = !!pujaId;

  const mapApiPujaToListItem = (item: any): EditRequest => ({
    id: item.id,
    image: item.image_url || '',
    name: item.title,
    pujaPurpose: item.short_description,
    price_with_samagri: item.price_with_samagri,
    price_without_samagri: item.price_without_samagri,
    user: 0,
    pooja: item.pooja,
    custom_samagri_list: '',
    price_status: 0,
  });

  const [pujaList, setPujaList] = useState<EditRequest[]>(() => {
    if (isEditMode && pujaData && typeof pujaData === 'object') {
      return [
        {
          id: pujaData.id,
          user: 0,
          pooja: pujaData.pooja,
          custom_samagri_list: '',
          image: pujaData.pooja_image_url,
          name: pujaData.pooja_title,
          pujaPurpose: pujaData.pooja_short_description,
          price_with_samagri: Number(pujaData.price_with_samagri),
          price_without_samagri: Number(pujaData.price_without_samagri),
          price_status: pujaData.price_status,
        },
      ];
    }
    return [];
  });

  useEffect(() => {
    if (!isEditMode) {
      setLoading(true);
      getUnassignPuja()
        .then((response: any) => {
          let data: any[] = [];
          if (Array.isArray(response)) {
            data = response;
          } else if (response && Array.isArray(response.data)) {
            data = response.data;
          }
          if (Array.isArray(data)) {
            setPujaList(data.map(mapApiPujaToListItem));
          } else {
            setPujaList([]);
          }
        })
        .catch(() => {
          setPujaList([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isEditMode]);

  const [selectedPuja, setSelectedPuja] = useState<number | null>(
    pujaData && typeof pujaData === 'object' ? pujaData.id : null,
  );

  const getInitialPriceOption = () => {
    if (pujaData && typeof pujaData === 'object') {
      return pujaData.price_status === 1 ? 'system' : 'custom';
    }
    return 'system';
  };

  const [selectedPriceOption, setSelectedPriceOption] = useState<
    'system' | 'custom'
  >(getInitialPriceOption());

  const [customPriceWithItems, setCustomPriceWithItems] = useState(
    pujaData && pujaData.price_with_samagri,
  );
  const [customPriceWithoutItems, setCustomPriceWithoutItems] = useState(
    pujaData && pujaData.price_without_samagri,
  );

  const [loading, setLoading] = useState<boolean>(false);

  const addPuja = async () => {
    if (
      selectedPriceOption === 'custom' &&
      (!customPriceWithItems ||
        customPriceWithItems.toString().trim() === '' ||
        !customPriceWithoutItems ||
        customPriceWithoutItems.toString().trim() === '')
    ) {
      showErrorToast('Please enter custom prices.');
      return;
    }

    setLoading(true);
    try {
      let userId: number | null = null;
      try {
        const userIdStr = await AsyncStorage.getItem('user_id');
        if (userIdStr) {
          userId = parseInt(userIdStr, 10);
        }
      } catch {
        userId = null;
      }
      if (selectedPuja == null || userId == null) {
        setLoading(false);
        return;
      }
      let poojaValue = selectedPuja;
      const selectedPujaObj = pujaList.find(p => p.id === selectedPuja);
      if (selectedPujaObj && typeof selectedPujaObj.pooja === 'number') {
        poojaValue = selectedPujaObj.pooja;
      }
      const addRequest: AddPuja = {
        user: userId,
        pooja: poojaValue,
        price_with_samagri:
          selectedPriceOption === 'custom'
            ? Number(customPriceWithItems)
            : 5000,
        price_without_samagri:
          selectedPriceOption === 'custom'
            ? Number(customPriceWithoutItems)
            : 3000,
        price_status: selectedPriceOption === 'system' ? 1 : 2,
      };
      const response = await postAddPuja(addRequest);
      if (response && (response as any).data.status === true) {
        showSuccessToast(response.data.message);
        navigation.goBack();
      }
    } catch (error) {
      showErrorToast(error as string);
    } finally {
      setLoading(false);
    }
  };

  const editPuja = async () => {
    if (
      selectedPriceOption === 'custom' &&
      (!customPriceWithItems ||
        customPriceWithItems.toString().trim() === '' ||
        !customPriceWithoutItems ||
        customPriceWithoutItems.toString().trim() === '')
    ) {
      showErrorToast('Please enter custom prices.');
      return;
    }

    setLoading(true);
    try {
      let userId: number | null = null;
      try {
        const userIdStr = await AsyncStorage.getItem('user_id');
        if (userIdStr) {
          userId = parseInt(userIdStr, 10);
        }
      } catch {
        userId = null;
      }

      if (
        selectedPuja == null ||
        userId == null ||
        customPriceWithItems == null ||
        customPriceWithoutItems == null
      ) {
        setLoading(false);
        return;
      }

      const editRequest: EditPuja = {
        id: selectedPuja,
        user: userId,
        pooja: pujaData && typeof pujaData === 'object' ? pujaData.pooja : 0,
        custom_samagri_list: '',
        price_with_samagri:
          selectedPriceOption === 'custom'
            ? Number(customPriceWithItems)
            : 5000,
        price_without_samagri:
          selectedPriceOption === 'custom'
            ? Number(customPriceWithoutItems)
            : 3000,
        price_status: selectedPriceOption === 'system' ? 1 : 2,
      };
      const response = await putPuja(editRequest);
      if (response && (response as any).data.status === true) {
        showSuccessToast(response.data.message);
        navigation.goBack();
      } else {
        setPujaList([]);
      }
    } catch {
      setPujaList([]);
    } finally {
      setLoading(false);
    }
  };

  const priceOptions: PriceOption[] = [
    {
      id: 'system',
      title: 'System Price',
      description: 'Rs. 5000 - With puja items\nRs. 3000 - Without puja items',
    },
    {
      id: 'custom',
      title: 'Custom Price',
    },
  ];

  const handlePujaSelection = (pujaId: number) => {
    setSelectedPuja(pujaId);
  };

  const handlePriceOptionSelection = (option: 'system' | 'custom') => {
    setSelectedPriceOption(option);
  };

  const handleAddPuja = () => {
    if (isEditMode) {
      editPuja();
    } else {
      addPuja();
    }
  };

  const renderSeparator = () => <View style={styles.separator} />;

  const renderPujaOption = (puja: EditRequest, index: number) => (
    <View key={puja.id}>
      <TouchableOpacity
        style={styles.pujaOptionContainer}
        onPress={() => handlePujaSelection(puja.id)}>
        <View style={styles.pujaContent}>
          {puja.image ? (
            <Image source={{uri: puja.image}} style={styles.pujaImage} />
          ) : (
            <View
              style={[
                styles.pujaImage,
                {
                  backgroundColor: COLORS.lightGray,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}>
              <Text style={{color: COLORS.gray, fontSize: 12}}>No Image</Text>
            </View>
          )}
          <View style={styles.pujaTextContainer}>
            <Text style={styles.pujaName}>{puja.name}</Text>
            <Text style={styles.pujaDescription}>{puja.pujaPurpose}</Text>
          </View>
        </View>
        <Octicons
          name={selectedPuja === puja.id ? 'check-circle' : 'circle'}
          size={24}
          color={selectedPuja === puja.id ? COLORS.primary : COLORS.gray}
        />
      </TouchableOpacity>
      {Array.isArray(pujaList) &&
        index < pujaList.length - 1 &&
        renderSeparator()}
    </View>
  );

  const renderPriceOption = (option: PriceOption, index: number) => (
    <View key={option.id}>
      <TouchableOpacity
        style={styles.priceOptionContainer}
        onPress={() => handlePriceOptionSelection(option.id)}>
        <View style={styles.priceContent}>
          <Text style={styles.priceTitle}>{option.title}</Text>
          {option.description && (
            <Text style={styles.priceDescription}>{option.description}</Text>
          )}
        </View>
        <Octicons
          name={selectedPriceOption === option.id ? 'check-circle' : 'circle'}
          size={24}
          color={
            selectedPriceOption === option.id ? COLORS.primary : COLORS.gray
          }
        />
      </TouchableOpacity>
      {index < priceOptions.length - 1 && renderSeparator()}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <UserCustomHeader
        title={isEditMode ? t('edit_puja') : t('add_puja')}
        showBackButton={true}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.sectionContainer, THEMESHADOW.shadow]}>
            {loading ? (
              <View style={{alignItems: 'center', padding: 20}}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : !Array.isArray(pujaList) || pujaList.length === 0 ? (
              <Text
                style={{textAlign: 'center', color: COLORS.gray, padding: 16}}>
                {t('no_items_found')}
              </Text>
            ) : (
              pujaList.map((puja, index) => renderPujaOption(puja, index))
            )}
          </View>

          <View style={[styles.sectionContainer, THEMESHADOW.shadow]}>
            {priceOptions.map((option, index) =>
              renderPriceOption(option, index),
            )}

            {selectedPriceOption === 'custom' && (
              <>
                <View style={styles.inputFieldContainer}>
                  <View style={styles.inputTitleContainer}>
                    <Text style={styles.inputLabel}>
                      Custom Price With Puja Items
                    </Text>
                  </View>
                  <View style={styles.inputAreaContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={customPriceWithItems}
                      onChangeText={setCustomPriceWithItems}
                      placeholder="Enter price"
                      placeholderTextColor={COLORS.gray}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputFieldContainer}>
                  <View style={styles.inputTitleContainer}>
                    <Text style={styles.inputLabel}>
                      Custom Price Without Puja Items
                    </Text>
                  </View>
                  <View style={styles.inputAreaContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={customPriceWithoutItems}
                      onChangeText={setCustomPriceWithoutItems}
                      placeholder="Enter price"
                      placeholderTextColor={COLORS.gray}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </>
            )}
          </View>

          <PrimaryButton
            title={
              isEditMode
                ? t('edit_puja').toUpperCase()
                : t('add_puja').toUpperCase()
            }
            onPress={handleAddPuja}
          />
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
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  pujaOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  pujaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 9,
  },
  pujaImage: {
    width: 52,
    height: 50,
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
    marginBottom: 7,
  },
  pujaDescription: {
    color: COLORS.pujaCardSubtext,
    fontSize: 13,
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginVertical: 13,
  },
  priceOptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  priceContent: {
    flex: 1,
    flexDirection: 'column',
  },
  priceTitle: {
    color: COLORS.primaryTextDark,
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
    letterSpacing: -0.33,
    marginBottom: 4,
  },
  priceDescription: {
    color: COLORS.pujaCardSubtext,
    fontSize: 13,
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
    lineHeight: 20,
  },
  inputFieldContainer: {
    marginTop: 12,
    width: '100%',
  },
  inputTitleContainer: {
    borderRadius: 100,
    height: 21,
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputLabel: {
    color: COLORS.inputLabelText,
    fontSize: 14,
    fontFamily: Fonts.Sen_Medium,
    letterSpacing: -0.28,
    lineHeight: 21,
  },
  inputAreaContainer: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBoder,
    minHeight: 46,
    width: '100%',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  textInput: {
    flex: 1,
    width: '100%',
    color: COLORS.primaryTextDark,
    fontSize: 14,
    fontFamily: Fonts.Sen_Regular,
    letterSpacing: -0.14,
    lineHeight: 20,
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
});

export default AddPujaScreen;
