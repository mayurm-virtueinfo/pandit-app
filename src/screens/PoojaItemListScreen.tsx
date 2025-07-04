import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, SafeAreaView} from 'react-native';
import {apiService, PoojaItem} from '../api/apiService';
import CustomHeader from '../components/CustomHeader';
import {COLORS} from '../theme/theme';
import {useTranslation} from 'react-i18next';
// import { COLORS } from '../theme/colors';

const PoojaItemListScreen: React.FC = () => {
  const [poojaItemList, setPoojaItemList] = useState<PoojaItem[]>([]);

  const {t} = useTranslation();

  const fetchPoojaItems = async () => {
    const requests = await apiService.getPoojaItems();
    console.log('Fetched getPoojaItems Requests:', requests);
    setPoojaItemList(requests);
  };

  useEffect(() => {
    fetchPoojaItems();
  }, []);

  const renderItem = ({item}: {item: PoojaItem}) => (
    <Text style={styles.listItem}>
      {item.id}. {item.name} - {item.amount} {item.unit}
    </Text>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={true}
        showMenuButton={false}
        title={t('list_of_pooja_items')}
      />
      <View style={styles.content}>
        <Text style={styles.description}>{t('pooja_item_desc')}</Text>
        <Text style={styles.totalAmount}>
          {t('total_item_price_received')}{' '}
          <Text style={styles.amountText}>Rs2000</Text>
        </Text>
        <FlatList
          data={poojaItemList}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};

export default PoojaItemListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  totalAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 12,
  },
  amountText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 24,
  },
  listItem: {
    fontSize: 15,
    color: '#111',
    marginBottom: 8,
  },
});
