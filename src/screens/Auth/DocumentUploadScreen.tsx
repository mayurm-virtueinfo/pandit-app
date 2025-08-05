import React, {useEffect, useState} from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import CustomHeader from '../../components/CustomHeader';
import {COLORS} from '../../theme/theme';
import PrimaryButton from '../../components/PrimaryButton';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DocumentSection from '../../components/DocumentSection';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {postRegisterFCMToken, postSignUp} from '../../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../../utils/AppContent';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {getMessaging, getToken} from '@react-native-firebase/messaging';

interface DocumentUploadState {
  idProof: boolean;
  panCard: boolean;
  electricityBill: boolean;
  certifications: boolean;
}

type RouteParams = {
  action?: string;
  phoneNumber?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  profile_img: any;
  address?: string;
  selectCityId?: number | string;
  selectedAreasId?: number[];
  selectedPoojaId?: number[];
  selectedLanguageId?: number[];
};

interface DocumentInfo {
  file: any;
  name: string | null;
  url: string | null;
}

const DocumentUploadScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackParamList>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

  const {
    phoneNumber,
    email,
    firstName,
    lastName,
    city,
    caste,
    subCaste,
    gotra,
    address,
    profile_img,
    selectCityId,
    selectedAreasId,
    selectedPoojaId,
    selectedLanguageId,
  } = route.params || {};

  const [uploadedDocuments, setUploadedDocuments] =
    useState<DocumentUploadState>({
      idProof: false,
      panCard: false,
      electricityBill: false,
      certifications: false,
    });

  const [documentInfo, setDocumentInfo] = useState<{
    [key in keyof DocumentUploadState]: DocumentInfo;
  }>({
    idProof: {
      name: null,
      url: null,
      file: undefined,
    },
    panCard: {
      name: null,
      url: null,
      file: undefined,
    },
    electricityBill: {
      name: null,
      url: null,
      file: undefined,
    },
    certifications: {
      name: null,
      url: null,
      file: undefined,
    },
  });

  const [loadingDocument, setLoadingDocument] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uid, setUid] = useState<string | null>('');

  useEffect(() => {
    fetchUID();
  }, []);

  const fetchUID = async () => {
    try {
      const uid = await AsyncStorage.getItem(AppConstant.FIREBASE_UID);
      setUid(uid);
    } catch (error) {
      console.error('Error fetching UID:', error);
    }
  };

  const uploadDocument = async (
    document: DocumentPickerResponse,
  ): Promise<DocumentPickerResponse> => {
    try {
      if (!document.uri || !document.type || !document.name) {
        throw new Error('Invalid document');
      }
      return document;
    } catch (error) {
      console.error('Failed to process document:', error);
      throw new Error('Failed to process document');
    }
  };

  const handleDocumentUpload = async (
    documentType: keyof DocumentUploadState,
  ) => {
    if (loadingDocument) return;

    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      if (result && result.length > 0) {
        const document = result[0];
        setLoadingDocument(documentType);

        const uploadResult = await uploadDocument(document);

        setUploadedDocuments(prev => ({
          ...prev,
          [documentType]: true,
        }));

        setDocumentInfo(prev => ({
          ...prev,
          [documentType]: {
            name: document.name || 'Selected Document',
            file: uploadResult,
          },
        }));

        setLoadingDocument(null);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return;
      }
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      setLoadingDocument(null);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || loadingDocument) return;

    const requiredDocuments = ['idProof', 'panCard'];
    const missingRequired = requiredDocuments.filter(
      doc => !uploadedDocuments[doc as keyof DocumentUploadState],
    );

    if (missingRequired.length > 0) {
      Alert.alert(
        'Missing Documents',
        'Please upload all required documents (ID Proof and PAN Card)',
      );
      return;
    }

    setIsSubmitting(true);

    const formData: FormData = new FormData();

    formData.append('mobile', phoneNumber);
    formData.append('email', email);
    formData.append('firebase_uid', uid);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('role', '2'); // As per curl, hardcoded '2'
    formData.append('address', address); // User's general address
    formData.append('city', selectCityId?.toString?.() ?? ''); // Ensure city ID is a string

    if (
      profile_img &&
      profile_img.uri &&
      profile_img.type &&
      profile_img.name
    ) {
      formData.append('profile_img', {
        uri: profile_img.uri,
        type: profile_img.type,
        name: profile_img.name,
      });
    } else {
      console.warn('Profile image is missing or incomplete. Skipping upload.');
    }

    if (Array.isArray(selectedPoojaId)) {
      selectedPoojaId.forEach(id =>
        formData.append('puja_ids', id?.toString?.() ?? ''),
      );
    }

    if (Array.isArray(selectedAreasId)) {
      selectedAreasId.forEach(id =>
        formData.append('area_ids', id?.toString?.() ?? ''),
      );
    }

    formData.append('pandit_detail.address_city', city?.toString?.() ?? '');
    formData.append('pandit_detail.caste', caste?.toString?.() ?? '');
    formData.append('pandit_detail.sub_caste', subCaste?.toString?.() ?? '');
    formData.append('pandit_detail.gotra', gotra?.toString?.() ?? '');

    const uniqueLanguageIds = [...new Set(selectedLanguageId)];
    uniqueLanguageIds.forEach(id =>
      formData.append(
        'pandit_detail.supported_languages',
        id?.toString?.() ?? '',
      ),
    );

    // Append document files
    if (documentInfo.idProof.file) {
      formData.append('pandit_documents.id_proof', {
        uri: documentInfo.idProof.file.uri,
        type: documentInfo.idProof.file.type,
        name: documentInfo.idProof.file.name,
      });
    }
    if (documentInfo.panCard.file) {
      formData.append('pandit_documents.pan_card', {
        uri: documentInfo.panCard.file.uri,
        type: documentInfo.panCard.file.type,
        name: documentInfo.panCard.file.name,
      });
    }
    if (documentInfo.electricityBill.file) {
      formData.append('pandit_documents.electricity_bill', {
        uri: documentInfo.electricityBill.file.uri,
        type: documentInfo.electricityBill.file.type,
        name: documentInfo.electricityBill.file.name,
      });
    }
    if (documentInfo.certifications.file) {
      formData.append('pandit_documents.certifications', {
        uri: documentInfo.certifications.file.uri,
        type: documentInfo.certifications.file.type,
        name: documentInfo.certifications.file.name,
      });
    }

    try {
      const response = await postSignUp(formData);

      if (response && response?.user && response?.user?.id) {
        await AsyncStorage.setItem(
          AppConstant.USER_ID,
          String(response.user.id),
        );
        await AsyncStorage.setItem(
          AppConstant.ACCESS_TOKEN,
          response.access_token,
        );
        await AsyncStorage.setItem(
          AppConstant.REFRESH_TOKEN,
          response.refresh_token,
        );
        const messaging = getMessaging();
        const fcmToken = await getToken(messaging);

        if (fcmToken) {
          postRegisterFCMToken(fcmToken, 'pandit');
        }
        navigation.replace('AppBottomTabNavigator');
      } else {
        console.warn('Signup response did not contain user.id:', response);
        Alert.alert('Error', 'Signup failed: Invalid response from server.');
      }
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null) {
        const err = error as {
          response?: {data?: {message?: string; detail?: string; errors?: any}};
          message?: string;
        };
        console.error(
          'Submission error:',
          err.response?.data || err.message || error,
        );

        let errorMessage = 'Failed to submit documents. Please try again.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response?.data?.errors) {
          errorMessage = Object.values(err.response.data.errors)
            .flat()
            .join('\n');
        }

        Alert.alert('Error', errorMessage);
      } else {
        console.error('Submission error (unknown type):', String(error));
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Button at the bottom, not inside ScrollView
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBackground}
      />
      <CustomHeader title="Documents" showBackButton={true} />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.formContainer}>
              <DocumentSection
                label="ID Proof (Aadhar Card)"
                buttonText="UPLOAD ID PROOF"
                isRequired={true}
                isUploaded={uploadedDocuments.idProof}
                documentType="idProof"
                onUpload={() => handleDocumentUpload('idProof')}
                documentName={documentInfo.idProof.name}
                documentUrl={documentInfo.idProof.url}
                isLoading={loadingDocument === 'idProof'}
              />

              <DocumentSection
                label="PAN Card"
                buttonText="UPLOAD PAN CARD"
                isRequired={true}
                isUploaded={uploadedDocuments.panCard}
                documentType="panCard"
                onUpload={() => handleDocumentUpload('panCard')}
                documentName={documentInfo.panCard.name}
                documentUrl={documentInfo.panCard.url}
                isLoading={loadingDocument === 'panCard'}
              />

              <DocumentSection
                label="Electricity Bill (Optional)"
                buttonText="UPLOAD ELECTRICITY BILL"
                isRequired={false}
                isUploaded={uploadedDocuments.electricityBill}
                documentType="electricityBill"
                onUpload={() => handleDocumentUpload('electricityBill')}
                documentName={documentInfo.electricityBill.name}
                documentUrl={documentInfo.electricityBill.url}
                isLoading={loadingDocument === 'electricityBill'}
              />

              <DocumentSection
                label="Certifications"
                buttonText="UPLOAD CERTIFICATIONS"
                isRequired={false}
                isUploaded={uploadedDocuments.certifications}
                documentType="certifications"
                onUpload={() => handleDocumentUpload('certifications')}
                documentName={documentInfo.certifications.name}
                documentUrl={documentInfo.certifications.url}
                isLoading={loadingDocument === 'certifications'}
              />
            </View>
          </ScrollView>
        </View>
        <View
          style={[
            styles.bottomButtonContainer,
            {paddingBottom: insets.bottom || verticalScale(16)},
          ]}>
          <PrimaryButton
            title={'SUBMIT'}
            onPress={handleSubmit}
            disabled={isSubmitting || !!loadingDocument}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(16), // Add some bottom padding so last field is not hidden by button
  },
  formContainer: {
    paddingHorizontal: scale(20),
  },
  submitButton: {
    minHeight: moderateScale(46),
    marginHorizontal: scale(20),
    // marginTop: verticalScale(24), // Remove marginTop so button is flush in bottom bar
  },
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.lightGray || '#eee',
    paddingTop: verticalScale(8),
    // paddingBottom: verticalScale(16), // Set dynamically with insets
  },
});

export default DocumentUploadScreen;
