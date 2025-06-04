import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { dropdownService, DropdownItem } from '../api/dropdownService';
import { useNavigation } from '@react-navigation/native';

// Mock data for cities as per screenshot, since getCities in dropdownService is pincode-based
const STATIC_CITIES: DropdownItem[] = [
  { id: '1', name: 'Mumbai' },
  { id: '2', name: 'Delhi' },
  { id: '3', name: 'Bangalore' },
  { id: '4', name: 'Hyderabad' },
  { id: '5', name: 'Chennai' },
];

const SelectCityAreaScreen = () => {
  const navigation = useNavigation();

  const [cities, setCities] = useState<DropdownItem[]>();
  const [areas, setAreas] = useState<DropdownItem[]>([]);
  const [filteredCities, setFilteredCities] = useState<DropdownItem[]>();
  const [filteredAreas, setFilteredAreas] = useState<DropdownItem[]>([]);

  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<DropdownItem | null>(null);

  const [citySearch, setCitySearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');

  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  useEffect(() => {
    // Fetch Areas
    const fetchAreas = async () => {
      setIsLoadingAreas(true);
      try {
        const [cities, areas ] = await Promise.all([
                dropdownService.getCities('110001'),
                dropdownService.getArea()
              ]);
        console.log('fetchCities : ',cities);
        console.log('fetchedAreas : ',areas);
        
        setCities(cities);
        setFilteredCities(cities);

        setAreas(areas);
        setFilteredAreas(areas);
      } catch (error) {
        console.error('Error fetching areas:', error);
        Alert.alert('Error', 'Could not load areas.');
      } finally {
        setIsLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    if (citySearch === '') {
      setFilteredCities(cities);
    } else {
      setFilteredCities(
        cities.filter(city =>
          city.name.toLowerCase().includes(citySearch.toLowerCase())
        )
      );
    }
  }, [citySearch, cities]);

  useEffect(() => {
    if (areaSearch === '') {
      setFilteredAreas(areas);
    } else {
      setFilteredAreas(
        areas.filter(area =>
          area.name.toLowerCase().includes(areaSearch.toLowerCase())
        )
      );
    }
  }, [areaSearch, areas]);

  const handleNext = () => {
    if (!selectedCity || !selectedArea) {
      Alert.alert('Validation Error', 'Please select both a city and an area.');
      return;
    }
    // Navigate to the next screen or perform an action
    Alert.alert('Selected', `City: ${selectedCity.name}, Area: ${selectedArea.name}`);
    // Example: navigation.navigate('NextScreen', { city: selectedCity, area: selectedArea });
  };

  const renderHeader = (title: string) => (
    <Text style={styles.listHeader}>{title}</Text>
  );

  const renderSearchInput = (placeholder: string, value: string, onChangeText: (text: string) => void) => (
    <View style={styles.searchInputContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
      />
    </View>
  );

  const renderRadioItem = (
    item: DropdownItem,
    isSelected: boolean,
    onSelect: () => void
  ) => (
    <TouchableOpacity onPress={onSelect} style={styles.radioItem}>
      <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
        {isSelected && <Text style={styles.radioButtonCheck}>✓</Text>}
      </View>
      <Text style={styles.radioLabel}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select your City & Area</Text>
      </View>

      <View style={styles.container}>
        {/* Cities List */}
        {renderHeader('City')}
        {renderSearchInput('Search for a city', citySearch, setCitySearch)}
        {isLoadingAreas ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <FlatList
            data={filteredCities}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) =>
              renderRadioItem(item, selectedCity?.id === item.id, () => setSelectedCity(item))
            }
            style={styles.list}
          />
        )}

        {/* Areas List */}
        {renderHeader('Area')}
        {renderSearchInput('Search for an area', areaSearch, setAreaSearch)}
        {isLoadingAreas ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <FlatList
            data={filteredAreas}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) =>
              renderRadioItem(item, selectedArea?.id === item.id, () => setSelectedArea(item))
            }
            style={styles.list}
          />
        )}
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, (!selectedCity || !selectedArea) && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!selectedCity || !selectedArea}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Light background color
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF', // White header bar
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#007AFF', // Blue color for back arrow
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  listHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#888',
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  list: {
    flexGrow: 0, // Important for multiple FlatLists if not nested in ScrollView
    maxHeight: 200, // Adjust as needed, or manage layout differently
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 4, // Square shape as per screenshot
    borderWidth: 2,
    borderColor: '#007AFF', // Blue border
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#007AFF', // Blue fill when selected
  },
  radioButtonCheck: {
    color: '#FFFFFF', // White checkmark
    fontSize: 14,
    fontWeight: 'bold',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F0F4F8', // Match safe area
  },
  nextButton: {
    backgroundColor: '#007AFF', // Blue button
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#A0CFFF', // Lighter blue when disabled
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SelectCityAreaScreen;