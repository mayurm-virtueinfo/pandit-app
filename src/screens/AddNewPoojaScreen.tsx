import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {Image} from 'react-native';
import {COLORS} from '../theme/theme';
import CustomHeader from '../components/CustomHeader';
import {apiService, PoojaRequestItem} from '../api/apiService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

const AddNewPoojaScreen: React.FC = () => {
  const [poojaRequests, setPoojaRequests] = useState<PoojaRequestItem[]>([]);
  const [selectedPooja, setSelectedPooja] = useState<string | null>(null);
  const [priceWithoutItems, setPriceWithoutItems] = useState(true);
  const [priceWithItems, setPriceWithItems] = useState(true);
  const [customPriceWithoutItems, setCustomPriceWithoutItems] = useState('');
  const [customPriceWithItems, setCustomPriceWithItems] = useState('');

  const {t, i18n} = useTranslation();

  useEffect(() => {
    fetchPoojaRequests();
  }, []);

  const fetchPoojaRequests = async () => {
    const requests = await apiService.getPoojaRequests();
    console.log('Fetched Pooja Requests:', requests);
    setPoojaRequests(requests);
  };

  const renderPoojaItem = ({item}: {item: PoojaRequestItem}) => {
    const isSelected = selectedPooja === item.title;
    return (
      <TouchableOpacity
        style={[styles.poojaCard, isSelected && styles.selectedCard]}
        onPress={() => setSelectedPooja(item.title)}>
        <View style={styles.radioCircle}>
          {isSelected && <View style={styles.selectedDot} />}
        </View>
        <Image source={{uri: item.imageUrl}} style={styles.poojaImage} />
        <View style={styles.poojaTextContainer}>
          <Text style={styles.poojaTitle}>{item.title}</Text>
          <Text style={styles.poojaSubtitle}>{item.subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={true}
        showMenuButton={false}
        title={t('add_new')}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>{t('search_by_pooja_name')}</Text>
        <TextInput
          placeholder={t('search_by_pooja_name')}
          style={styles.searchInput}
          editable={false}
        />

        <FlatList
          data={poojaRequests}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          renderItem={renderPoojaItem}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>{t('system_price')}</Text>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            onPress={() => setPriceWithoutItems(!priceWithoutItems)}>
            <Ionicons
              name={priceWithoutItems ? 'checkbox' : 'square-outline'}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <View style={{marginLeft: 12}}>
            <Text style={styles.price}>{t('rs_5000')}</Text>
            <Text style={styles.subText}>{t('without_pooja_items')}</Text>
          </View>
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity onPress={() => setPriceWithItems(!priceWithItems)}>
            <Ionicons
              name={priceWithItems ? 'checkbox' : 'square-outline'}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <View style={{marginLeft: 12}}>
            <Text style={styles.price}>{t('rs_8000')}</Text>
            <Text style={styles.subText}>{t('with_pooja_items')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('or')}</Text>

        <Text style={styles.inputLabel}>
          {t('enter_custom_price_without_pooja_items')}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('rs_5000')}
          value={customPriceWithoutItems}
          onChangeText={setCustomPriceWithoutItems}
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>
          {t('enter_custom_price_with_pooja_items')}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('rs_7000')}
          value={customPriceWithItems}
          onChangeText={setCustomPriceWithItems}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{t('add_new_button')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddNewPoojaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#999',
  },
  poojaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fdfdfd',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0faff',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedDot: {
    height: 10,
    width: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  poojaImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  poojaTextContainer: {
    flex: 1,
  },
  poojaTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  poojaSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: '#999',
  },
  inputLabel: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
