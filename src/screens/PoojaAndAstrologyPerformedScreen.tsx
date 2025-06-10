import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthNavigator'; // Will be updated
import { apiService, DropdownItem } from '../api/apiService';
import { COLORS } from '../theme/theme';
import CustomHeader from '../components/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'PoojaAndAstrologyPerformed'
>;

const PoojaAndAstrologyPerformedScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const [poojaItems, setPoojaItems] = useState<DropdownItem[]>([]);
  const [astrologyItems, setAstrologyItems] = useState<DropdownItem[]>([]);

  const [selectedPoojaItems, setSelectedPoojaItems] = useState<DropdownItem[]>([]);
  const [selectedAstrologyItems, setSelectedAstrologyItems] = useState<DropdownItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [fetchedPoojaItems, fetchedAstrologyItems] = await Promise.all([
          apiService.getPoojaPerformed(),
          apiService.getAstrologyConsulationPerformed(),
        ]);
        setPoojaItems(fetchedPoojaItems);
        setAstrologyItems(fetchedAstrologyItems);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Could not load selection data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleSelection = (
    item: DropdownItem,
    currentSelection: DropdownItem[],
    setter: React.Dispatch<React.SetStateAction<DropdownItem[]>>
  ) => {
    const isSelected = currentSelection.find(selected => selected.id === item.id);
    if (isSelected) {
      setter(currentSelection.filter(selected => selected.id !== item.id));
    } else {
      setter([...currentSelection, item]);
    }
  };

  const handleSubmit = () => {
    if (selectedPoojaItems.length === 0 && selectedAstrologyItems.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one Pooja or Astrology service.');
      return;
    }
    // Navigate to LanguagesScreen
    navigation.navigate('Languages');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderCheckboxItem = (
    item: DropdownItem,
    isSelected: boolean,
    onToggle: () => void
  ) => (
    <TouchableOpacity key={`${item.id}-${item.name}`} onPress={onToggle} style={styles.checkboxItemContainer}>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderListSection = (
    title: string,
    items: DropdownItem[],
    selectedItems: DropdownItem[],
    toggleFunc: (item: DropdownItem) => void
  ) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length === 0 && !isLoading ? <Text>No items available.</Text> : null}
      {items.map(item =>
        renderCheckboxItem(
          item,
          selectedItems.some(selected => selected.id === item.id),
          () => toggleFunc(item)
        )
      )}
    </View>
  );

  const inset = useSafeAreaInsets();
  return (
    <>
      <CustomHeader showBackButton={true} showMenuButton={false} title={'Pooja or Astrology Performed'} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <>
            {renderListSection(
              'Pooja performed:',
              poojaItems,
              selectedPoojaItems,
              (item) => toggleSelection(item, selectedPoojaItems, setSelectedPoojaItems)
            )}
            {renderListSection(
              'Astrology consulation peformed:',
              astrologyItems,
              selectedAstrologyItems,
              (item) => toggleSelection(item, selectedAstrologyItems, setSelectedAstrologyItems)
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer,{marginBottom:inset.bottom}]}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            (selectedPoojaItems.length === 0 && selectedAstrologyItems.length === 0) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={selectedPoojaItems.length === 0 && selectedAstrologyItems.length === 0}
        >
          <Text style={[styles.buttonText, styles.submitButtonText]}>Submit</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light gray background
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    // borderBottomWidth: 1, // No border in screenshot
    // borderBottomColor: '#E0E0E0',
    minHeight: 50, // Ensure header bar has some height even without title
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loader: {
    marginTop: 50,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  checkboxItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align checkbox to top with multi-line text
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4, // Square shape
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    marginTop: 3, // Align with first line of text
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  itemDescription: {
    fontSize: 13,
    color: '#666666',
    marginTop: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E9ECEF', // Lighter gray for cancel
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: COLORS.primary, // Blue for submit
    marginLeft: 10,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.primaryDisabled,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#495057', // Darker gray text for cancel
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
});

export default PoojaAndAstrologyPerformedScreen;