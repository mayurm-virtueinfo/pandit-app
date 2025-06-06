import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { apiService, PoojaRequestItem } from '../api/apiService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PoojaRequestParamList } from '../navigation/PoojaRequestNavigator';

import  Ionicons  from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../theme/theme';
import CustomHeader from '../components/CustomHeader';
import { PoojaListParamList } from '../navigation/PoojaListNavigator';

// Navigation type
type ScreenNavigationProp = StackNavigationProp<
  PoojaListParamList,
  'AddNewPooja'|'PoojaRequestDetail'
>;

const PoojaListScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [poojaRequests, setPoojaRequests] = useState<PoojaRequestItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPoojaRequests();
  }, []);

  const fetchPoojaRequests = async () => {
    const requests = await apiService.getPoojaRequests();
    setPoojaRequests(requests);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPoojaRequests();
    setRefreshing(false);
  };

  const handleRequestPressEdit = (item: PoojaRequestItem) => {
    navigation.navigate('AddNewPooja');
  };
  const handleRequestPressAdd = () => {
    navigation.navigate('AddNewPooja');
  };
  const handleRequestPressDetail = (item: PoojaRequestItem) => {
    navigation.navigate('PoojaRequestDetail', { request: item });
  };

  const renderItem = ({ item }: { item: PoojaRequestItem }) => (
    <TouchableOpacity onPress={() => handleRequestPressDetail(item)} style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardText}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRequestPressEdit(item)} style={styles.editButton}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomHeader showBackButton={false} showMenuButton={true} title={'Pooja List'}/>
      <FlatList
        data={poojaRequests}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <TouchableOpacity  onPress={() => handleRequestPressAdd()} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add New Pooja</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PoojaListScreen;
