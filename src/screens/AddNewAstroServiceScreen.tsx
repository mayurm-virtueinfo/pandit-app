import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { apiService, AstroServiceItem } from '../api/apiService';
import RadioButton from '../components/RadioButton';
import Checkbox from '../components/Checkbox';
import { COLORS } from '../theme/theme';

const AddNewAstroServiceScreen: React.FC = () => {
  const [astroServices, setAstroServices] = useState<AstroServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState('');
  const [enableChat, setEnableChat] = useState(false);
  const [enableAudio, setEnableAudio] = useState(false);
  const [enableVideo, setEnableVideo] = useState(false);

  useEffect(() => {
    fetchAstroServices();
  }, []);

  const fetchAstroServices = async () => {
    const requests = await apiService.getAstroServices();
    console.log('Fetched Pooja Requests:', requests);
    setAstroServices(requests);
  };

  const renderServiceItem = ({ item }: { item: AstroServiceItem }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => setSelectedServiceId(item.id)}
    >
      <RadioButton
        selected={selectedServiceId === item.id}
        color={COLORS.primary}
      />
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.serviceTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomHeader showBackButton={true} showMenuButton={false} title={'Add New'} />

      <ScrollView>
        <Text style={styles.sectionTitle}>Search by Astro Service Name</Text>
      <TextInput
        placeholder="Search by Astro Service Name"
        style={styles.searchInput}
        placeholderTextColor="#999"
      />

      <FlatList
        data={astroServices}
        renderItem={renderServiceItem}
        keyExtractor={(item,index) => `${item.id}-${index}`}
        scrollEnabled={false}
        style={styles.serviceList}
      />

      <Text style={styles.sectionTitle}>System Price</Text>
      <Checkbox
        label="Rs 30/min"
        checked
        disabled
        color={COLORS.primary}
      />

      <Text style={styles.orText}>OR</Text>

      <Text style={styles.sectionTitle}>Enter Custom Price (Per Minute)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={customPrice}
        onChangeText={setCustomPrice}
        placeholder="Rs 50"
        placeholderTextColor="#999"
      />

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Text style={styles.toggleText}>Enable Chat</Text>
          <Text style={styles.toggleDesc}>Allow chat functionality for this service</Text>
        </View>
        <Switch
          value={enableChat}
          onValueChange={setEnableChat}
          thumbColor={enableChat ? COLORS.primary : '#ccc'}
          trackColor={{ false: '#ccc', true: '#ccc' }}
        />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Text style={styles.toggleText}>Enable Audio Call</Text>
          <Text style={styles.toggleDesc}>Allow audio calling for this service</Text>
        </View>
        <Switch
          value={enableAudio}
          onValueChange={setEnableAudio}
          thumbColor={enableAudio ? COLORS.primary : '#ccc'}
          trackColor={{ false: '#ccc', true: '#ccc' }}
          
        />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Text style={styles.toggleText}>Enable Video Call</Text>
          <Text style={styles.toggleDesc}>Allow video calling for this service</Text>
        </View>
        <Switch
          value={enableVideo}
          onValueChange={setEnableVideo}
          thumbColor={enableVideo ? COLORS.primary : '#ccc'}
          trackColor={{ false: '#ccc', true: '#ccc' }}
        />
      </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add New</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    fontWeight: 'bold',
    fontSize: 15,
  },
  searchInput: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
  },
  serviceList: {
    marginHorizontal: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 48,
    height: 48,
    marginHorizontal: 10,
    borderRadius: 6,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orText: {
    alignSelf: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    marginHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  toggleLabel: {
    flex: 1,
    marginRight: 10,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddNewAstroServiceScreen;
