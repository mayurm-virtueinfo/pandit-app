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
import { dropdownService, DropdownItem } from '../api/dropdownService';

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Languages' // Assuming this will be the route name
>;

const LanguagesScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const [languages, setLanguages] = useState<DropdownItem[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<DropdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadLanguages = async () => {
      setIsLoading(true);
      try {
        const fetchedLanguages = await dropdownService.getLanguages();
        setLanguages(fetchedLanguages);
      } catch (error) {
        console.error('Error fetching languages:', error);
        Alert.alert('Error', 'Could not load languages.');
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguages();
  }, []);

  const toggleLanguageSelection = (language: DropdownItem) => {
    setSelectedLanguages(prevSelected => {
      const isSelected = prevSelected.find(lang => lang.id === language.id);
      if (isSelected) {
        return prevSelected.filter(lang => lang.id !== language.id);
      } else {
        return [...prevSelected, language];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedLanguages.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one language.');
      return;
    }
    Alert.alert('Success', 'Languages submitted (mock).');
    // Example: navigation.navigate('NextScreenAfterLanguages');
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
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Languages Selection</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Select your own languages:</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : languages.length === 0 ? (
          <Text>No languages available.</Text>
        ) : (
          languages.map(lang =>
            renderCheckboxItem(
              lang,
              selectedLanguages.some(selected => selected.id === lang.id),
              () => toggleLanguageSelection(lang)
            )
          )
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            selectedLanguages.length === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedLanguages.length === 0}
        >
          <Text style={[styles.buttonText, styles.submitButtonText]}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background as per screenshot
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loader: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16, // Slightly smaller than other section titles based on screenshot
    fontWeight: '500', // Medium weight
    color: '#333333',
    marginBottom: 15,
  },
  checkboxItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8F9FA', // Light background for items
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF', // Lighter border
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 16,
    color: '#333333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E9ECEF',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0CFFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#495057',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
});

export default LanguagesScreen;