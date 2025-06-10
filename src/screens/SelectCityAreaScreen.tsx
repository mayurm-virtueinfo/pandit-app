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
import { apiService, DropdownItem } from '../api/apiService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // Import for typing navigation
import { AuthStackParamList } from '../navigation/AuthNavigator'; // Import your param list
import { COLORS } from '../theme/theme';
import CustomHeader from '../components/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const SelectCityAreaScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const [cities, setCities] = useState<DropdownItem[]>([]);
  const [areas, setAreas] = useState<DropdownItem[]>([]);
  const [filteredCities, setFilteredCities] = useState<DropdownItem[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<DropdownItem[]>([]);

  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<DropdownItem | null>(null);

  const [citySearch, setCitySearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');

  const [isLoadingData, setIsLoadingData] = useState(false); // Renamed for clarity

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch both cities (with a default/example pincode) and areas
        const [fetchedCities, fetchedAreas] = await Promise.all([
          apiService.getCities('110001'), // Example pincode, adjust if needed
          apiService.getArea(),
        ]);

        setCities(fetchedCities);
        setFilteredCities(fetchedCities);

        setAreas(fetchedAreas);
        setFilteredAreas(fetchedAreas);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Could not load city/area data.');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (citySearch === '') {
      setFilteredCities(cities);
    } else {
      setFilteredCities(
        (cities || []).filter(city => // Add null check for safety, though initialized
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
    // Navigate to DocumentsScreen
    navigation.navigate('Documents');
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
  const inset = useSafeAreaInsets();
  return (
    <>
      <CustomHeader showBackButton={true} showMenuButton={false} title={'Select your City & Area'} />
      {/* <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select your City & Area</Text>
      </View> */}

      <View style={styles.container}>
        {/* Cities List */}
        {renderHeader('City')}
        {renderSearchInput('Search for a city', citySearch, setCitySearch)}
        {isLoadingData ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
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
        {isLoadingData ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
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


      </View>
      <View style={[styles.footer,{marginBottom:inset.bottom}]}>
        <TouchableOpacity
          style={[styles.nextButton, (!selectedCity || !selectedArea) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedCity || !selectedArea}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </>
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
    color: COLORS.primary, // Blue color for back arrow
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
    // backgroundColor: '#FFFFFF',
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
    borderColor: COLORS.primary, // Blue border
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: COLORS.primary, // Blue fill when selected
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
    marginLeft:20,
    marginRight:20
    // borderTopWidth: 1,
    // borderTopColor: '#E0E0E0',
    // backgroundColor: '#F0F4F8', // Match safe area
  },
  nextButton: {
    backgroundColor: COLORS.primary, // Blue button
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.primaryDisabled, // Lighter blue when disabled
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SelectCityAreaScreen;