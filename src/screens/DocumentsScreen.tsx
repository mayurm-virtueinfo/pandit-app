import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthNavigator'; // Assuming this will be updated
import { COLORS } from '../theme/theme';
import CustomHeader from '../components/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DocumentsScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Documents'
>;

interface DocumentFile {
  name: string;
  uri?: string; // For actual file URI if a picker was used
  type?: string; // Mime type
}

const DocumentsScreen = () => {
  const navigation = useNavigation<DocumentsScreenNavigationProp>();

  const [idProof, setIdProof] = useState<DocumentFile | null>(null);
  const [panCard, setPanCard] = useState<DocumentFile | null>(null);
  const [electricityBill, setElectricityBill] = useState<DocumentFile | null>(null);
  const [certifications, setCertifications] = useState<DocumentFile | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Mock file picker function
  const handlePickDocument = (
    setter: React.Dispatch<React.SetStateAction<DocumentFile | null>>,
    docType: string
  ) => {
    // In a real app, you would use a document picker library here
    // For example: DocumentPicker.getDocumentAsync(...)
    Alert.alert(
      "Pick Document",
      `Simulating picking a ${docType}. A placeholder will be set.`,
      [
        {
          text: "OK",
          onPress: () => setter({ name: `${docType.toLowerCase().replace(' ', '_')}_document.pdf` }),
        },
      ]
    );
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[docType.toLowerCase().replace(/\s+/g, '')]; // e.g., idproof(aadharcard)* -> idproof(aadharcard)
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!idProof) {
      newErrors.idProof = 'ID Proof (Aadhar Card) is required.';
    }
    if (!panCard) {
      newErrors.panCard = 'PAN Card is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to PoojaAndAstrologyPerformedScreen
      navigation.navigate('PoojaAndAstrologyPerformed');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderFileInput = (
    label: string,
    isOptional: boolean,
    file: DocumentFile | null,
    onPress: () => void,
    error?: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {isOptional ? <Text style={styles.optionalText}> (Optional)</Text> : <Text style={styles.requiredText}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.fileInput, error ? styles.errorBorder : null]}
        onPress={onPress}
      >
        <Text style={file ? styles.fileNameText : styles.placeholderText}>
          {file ? file.name : `Upload ${label.split('(')[0].trim().toLowerCase()}`}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const inset = useSafeAreaInsets();
  return (
    <>
      <CustomHeader showBackButton={true} showMenuButton={false} title={'Documents'} />
      {/* <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
      </View> */}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderFileInput(
          'ID Proof (Aadhar Card)',
          false,
          idProof,
          () => handlePickDocument(setIdProof, 'ID Proof'),
          errors.idProof
        )}
        {renderFileInput(
          'PAN Card',
          false,
          panCard,
          () => handlePickDocument(setPanCard, 'PAN Card'),
          errors.panCard
        )}
        {renderFileInput(
          'Electricity Bill',
          true,
          electricityBill,
          () => handlePickDocument(setElectricityBill, 'Electricity Bill'),
          errors.electricityBill
        )}
        {renderFileInput(
          'Certifications',
          true, // Assuming optional based on no asterisk in screenshot
          certifications,
          () => handlePickDocument(setCertifications, 'Certifications'),
          errors.certifications
        )}
      </ScrollView>

      <View style={[styles.footer,{marginBottom:inset.bottom}]}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNext}>
          <Text style={[styles.buttonText, styles.nextButtonText]}>Next</Text>
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
    color: '#000000', // Black color for back arrow
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', // Black title
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  requiredText: {
    color: 'red',
  },
  optionalText: {
    color: '#666666',
    fontWeight: 'normal',
    fontSize: 14,
  },
  fileInput: {
    backgroundColor: '#F0F0F0', // Light gray background for input
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 15,
    justifyContent: 'center',
    minHeight: 50,
  },
  placeholderText: {
    fontSize: 16,
    color: '#A0A0A0', // Placeholder text color
  },
  fileNameText: {
    fontSize: 16,
    color: '#333333',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  errorBorder: {
    borderColor: 'red',
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0', // Light gray for cancel
    marginRight: 10,
  },
  nextButton: {
    backgroundColor: COLORS.primary, // Blue for next
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333333',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});

export default DocumentsScreen;