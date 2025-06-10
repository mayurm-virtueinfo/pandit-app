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
import { AuthStackParamList } from '../navigation/AuthNavigator'; // This might change depending on where LanguagesScreen lives
import { AppDrawerParamList } from '../navigation/DrawerNavigator'; // Import Drawer param list
import { NavigatorScreenParams } from '@react-navigation/native'; // Import NavigatorScreenParams
import { apiService, DropdownItem } from '../api/apiService';
import { COLORS } from '../theme/theme';
import { RootStackParamList } from '../navigation/RootNavigator';
import CustomHeader from '../components/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Define a more general ParamList that includes the AppDrawer
// This assumes LanguagesScreen is part of a stack that can navigate to AppDrawer


type ScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

const LanguagesScreen: React.FC = () => { // Added React.FC
  const navigation = useNavigation<ScreenNavigationProp>();

  const [languages, setLanguages] = useState<DropdownItem[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<DropdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadLanguages = async () => {
      setIsLoading(true);
      try {
        const fetchedLanguages = await apiService.getLanguages();
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
    // Alert.alert('Success', 'Languages submitted (mock).');
    // Navigate to the Drawer Navigator, targeting the 'MainApp' (BottomTabNavigator)
    // and its initial 'Home' screen.
    //  navigation.replace('Main');
    navigation.navigate('Main', {
      screen: 'AppDrawer', // Navigate to the Drawer Navigator
      params: {
        screen: 'MainApp', // Navigate to the MainApp screen within the Drawer
      } as NavigatorScreenParams<AppDrawerParamList>, // Ensure params are typed correctly
    });
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

  const inset = useSafeAreaInsets();

  return (
    <>
      <CustomHeader showBackButton={true} showMenuButton={false} title={'Languages Selection'} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Select your own languages:</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
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

      <View style={[styles.footer,{marginBlock:inset.bottom}]}>
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
    </>
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
    borderColor: COLORS.primary,
    marginRight: 12,
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
  itemName: {
    fontSize: 16,
    color: '#333333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
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
    backgroundColor: COLORS.primary,
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
    color: '#495057',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
});

export default LanguagesScreen;