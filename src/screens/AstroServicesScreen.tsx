import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { apiService, AstroServiceItem } from '../api/apiService';
import CustomHeader from '../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/theme';
import { AstroServiceParamList } from '../navigation/AstroServiceNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

type ScreenNavigationProp = StackNavigationProp<
  AstroServiceParamList,
  'AddNewAstroService'
>;
const AstroServicesScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [astroServices, setAstroServices] = useState<AstroServiceItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAstroServices();
  }, []);

  const fetchAstroServices = async () => {
    const requests = await apiService.getAstroServices();
    console.log('Fetched Astro Services:', requests);
    setAstroServices(requests);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAstroServices();
    setRefreshing(false);
  };

  const handleEditPress = (item: AstroServiceItem) => {
    console.log('Edit pressed:', item);
    // Navigate to Edit Screen or show modal
  };

  const renderItem = ({ item }: { item: AstroServiceItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        {!!item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
        <Text style={styles.price}>{`Rs ${item.pricePerMin}/min`}</Text>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditPress(item)}
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={false}
        showMenuButton={true}
        title={'Astro Services'}
      />
      <FlatList
        data={astroServices}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddNewAstroService')}>
        <Text style={styles.addButtonText}>Add New Astro Service</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    color: '#888',
    marginTop: 2,
    fontSize: 13,
  },
  price: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    margin: 16,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AstroServicesScreen;
