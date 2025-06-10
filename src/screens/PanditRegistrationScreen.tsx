import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // Import for typing navigation
import { AuthStackParamList } from '../navigation/AuthNavigator'; // Import your param list
import {apiService, DropdownItem} from '../api/apiService';
import CustomHeader from '../components/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: DropdownItem | null;
  caste: DropdownItem | null;
  subCaste: DropdownItem | null;
  gotra: DropdownItem | null;
  address: string;
}

interface DropdownState {
  cities: DropdownItem[];
  castes: DropdownItem[];
  subCastes: DropdownItem[];
  gotras: DropdownItem[];
  loading: boolean;
  error: string | null;
}

const PanditRegistrationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '+1 234 567 8901',
    city: null,
    caste: null,
    subCaste: null,
    gotra: null,
    address: '',
  });

  const [dropdownData, setDropdownData] = useState<DropdownState>({
    cities: [],
    castes: [],
    subCastes: [],
    gotras: [],
    loading: false,
    error: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState<{
    type: 'city' | 'caste' | 'subCaste' | 'gotra';
    data: DropdownItem[];
    title: string;
  } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.caste) {
      loadSubCastes(formData.caste.id as number);
    }
  }, [formData.caste]);

  const loadInitialData = async () => {
    setDropdownData(prev => ({...prev, loading: true, error: null}));
    try {
      const [cities, castes, subCastes, gotras] = await Promise.all([
        apiService.getCities('110001'),
        apiService.getCastes(),
        apiService.getSubCastes(1),
        apiService.getGotras(),
      ]);

      console.log(' cities : ',cities);
      console.log(' castes : ',castes);
      console.log(' subCastes : ',subCastes);
      console.log(' gotras : ',gotras);

      setDropdownData(prev => ({
        ...prev,
        cities, castes, subCastes, gotras,
        loading: false,
      }));
    } catch (error) {
      setDropdownData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dropdown data',
      }));
    }
  };

  const loadCities = async (pincode: string) => {
    if (pincode.length === 6) {
      setDropdownData(prev => ({...prev, loading: true, error: null}));
      try {
        const cities = await apiService.getCities(pincode);
        setDropdownData(prev => ({...prev, cities, loading: false}));
      } catch (error) {
        setDropdownData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load cities',
        }));
      }
    }
  };

  const loadSubCastes = async (casteId: number) => {
    setDropdownData(prev => ({...prev, loading: true, error: null}));
    try {
      const subCastes = await apiService.getSubCastes(casteId);
      setDropdownData(prev => ({...prev, subCastes, loading: false}));
    } catch (error) {
      setDropdownData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load sub-castes',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.caste) {
      newErrors.caste = 'Caste is required';
    }
    if (!formData.gotra) {
      newErrors.gotra = 'Gotra is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Navigate to SelectCityAreaScreen upon successful submission
      navigation.navigate('SelectCityArea');
    } else {
      Alert.alert('Error', 'Please fill all required fields correctly');
    }
  };

  const openDropdown = (type: 'city' | 'caste' | 'subCaste' | 'gotra') => {
    let data: DropdownItem[] = [];
    let title = '';

    switch (type) {
      case 'city':
        data = dropdownData.cities;
        title = 'Select City';
        break;
      case 'caste':
        data = dropdownData.castes;
        title = 'Select Caste';
        break;
      case 'subCaste':
        // data = dropdownData.subCastes;
        // const type = 'subCaste';
        const item : DropdownItem | null = formData['caste'];
        console.log('dropdownData.subCastes : ',dropdownData.subCastes)
        console.log('item : ',item)
        const subCastesFilter = dropdownData.subCastes.filter((subCaste: any) => subCaste.casteId === item?.id); 
        let mData = [];
        console.log('subCastesFilter : ',subCastesFilter);
        if(subCastesFilter.length > 0){
          mData = subCastesFilter[0].subCastes;
        }else{
          mData = [];
        }
        data = mData;
        title = 'Select Sub-Caste';
        break;
      case 'gotra':
        data = dropdownData.gotras;
        title = 'Select Gotra';
        break;
    }

    setCurrentDropdown({type, data, title});
    setModalVisible(true);
  };

  const handleSelect = async (item: DropdownItem) => {

    if (currentDropdown) {
    //   console.log('handleSelect : type : ', currentDropdown.type)
    //   console.log('handleSelect : item : ', item)
    //   if (currentDropdown.type == 'caste') {
    //     setDropdownData(prev => ({
    //       ...prev,
    //       loading: true,
    //       error: 'Failed to load sub-castes',
    //     }));
    //     const subCastesRes = await apiService.getSubCastes(parseInt(`${item.id}`));
    //     const subCastesFilter = subCastesRes.filter((subCaste: any) => subCaste.casteId === item.id); 
    //     let subCastes = [];
    //     if (subCastesFilter.length > 0) {
    //       subCastes = subCastesFilter[0].subCastes;
    //     }

    //     console.log('subCastes : ', subCastes)  
    //     setDropdownData(prev => ({
    //       ...prev,
    //       loading: false,
    //       subCastes
    //     }));
    //     setFormData(prev => ({ ...prev, [currentDropdown.type]: item }));
    //   } else {
    //     setFormData(prev => ({ ...prev, [currentDropdown.type]: item }));
    //   }
      setFormData(prev => ({ ...prev, [currentDropdown.type]: item }));
      setModalVisible(false);
    }
  };

  const DropdownField = ({
    label,
    value,
    type,
    error,
  }: {
    label: string;
    value: DropdownItem | null;
    type: 'city' | 'caste' | 'subCaste' | 'gotra';
    error?: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectField, error && styles.errorField]}
        onPress={() => openDropdown(type)}>
        <Text
          style={[
            styles.selectText,
            value ? styles.activeSelectText : styles.placeholderText,
          ]}>
          {value ? value.name : `Select ${label.toLowerCase()}`}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
  const inset = useSafeAreaInsets();
  return (
    <>
    <CustomHeader showBackButton={true} showMenuButton={false} title={'Panditji Registration'}/>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panditji Registration</Text>
        <View style={styles.backButton} />
      </View> */}

      <ScrollView style={styles.scrollView}>
        <Text style={styles.description}>
          Registering allows you to access personalized services, receive
          updates, and manage your preferences easily. It also helps us serve
          you better by understanding your needs.
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.errorField]}
              placeholder="Enter your first name"
              placeholderTextColor="#9ca3af"
              value={formData.firstName}
              onChangeText={text => setFormData({...formData, firstName: text})}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.errorField]}
              placeholder="Enter your last name"
              placeholderTextColor="#9ca3af"
              value={formData.lastName}
              onChangeText={text => setFormData({...formData, lastName: text})}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              editable={false}
            />
          </View>

          <DropdownField
            label="City"
            value={formData.city}
            type="city"
            error={errors.city}
          />

          <DropdownField
            label="Caste"
            value={formData.caste}
            type="caste"
            error={errors.caste}
          />

          <DropdownField
            label="Sub-Caste"
            value={formData.subCaste}
            type="subCaste"
            error={errors.subCaste}
          />

          <DropdownField
            label="Gotra"
            value={formData.gotra}
            type="gotra"
            error={errors.gotra}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[
                styles.input,
                styles.addressInput,
                errors.address && styles.errorField,
              ]}
              placeholder="Enter your address"
              placeholderTextColor="#9ca3af"
              value={formData.address}
              onChangeText={text => setFormData({...formData, address: text})}
              multiline
            />
            <Text style={styles.helperText}>
              Please provide your full address including house number, street,
              and locality. This information is crucial for accurate service
              delivery and communication.
            </Text>
            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.button,{marginBottom:inset.bottom}]} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentDropdown?.title || 'Select'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            {dropdownData.loading ? (
              <ActivityIndicator size="large" color="#00bcd4" />
            ) : (
              <FlatList
                data={currentDropdown?.data || []}
                keyExtractor={item => `${item?.id}_${item?.name}`}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(item)}>
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView></>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    marginTop: Platform.OS === 'ios' ? 44 : 0,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#374151',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  description: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  selectField: {
    width: '100%',
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 16,
  },
  activeSelectText: {
    color: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  errorField: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  button: {
    height: 48,
    backgroundColor: '#00bcd4',
    borderRadius: 8,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#374151',
    fontWeight: '600',
  },
  dropdownItem: {
    padding: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});

export default PanditRegistrationScreen;
