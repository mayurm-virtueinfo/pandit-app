import React, {useState} from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import CustomHeader from '../../components/CustomHeader';
import {COLORS} from '../../theme/theme';
import PrimaryButton from '../../components/PrimaryButton';
import Fonts from '../../theme/fonts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DocumentSection from '../../components/DocumentSection';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {postSignUp} from '../../api/apiService';

interface DocumentUploadState {
  idProof: boolean;
  panCard: boolean;
  electricityBill: boolean;
  certifications: boolean;
}

interface DocumentInfo {
  name: string | null;
  url: string | null;
}

const DocumentUploadScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
    idProof: {name: null, url: null},
    panCard: {name: null, url: null},
    electricityBill: {name: null, url: null},
    certifications: {name: null, url: null},
  });

  console.log(documentInfo);

  const [loadingDocument, setLoadingDocument] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDocument = async (signUpData: any) => {
    setIsSubmitting(true);
    try {
      const response = await postSignUp(signUpData);
      // Handle success (e.g., navigate to next screen or show success message)
      // Example: navigation.navigate('NextScreen');
      console.log('Sign up successful:', response);
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Sign up failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadDocument = async (
    document: DocumentPickerResponse,
  ): Promise<{url: string}> => {
    try {
      const url = document.uri;
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({url});
        }, 1000);
      });
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
            url: uploadResult.url,
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

  const handleSubmit = () => {
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

    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Success', 'Documents submitted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBackground}
      />
      <CustomHeader title="Documents" showBackButton={true} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
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

        <PrimaryButton
          title={'SUBMIT'}
          onPress={handleSubmit}
          disabled={isSubmitting || !!loadingDocument}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
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
  },
  formContainer: {
    paddingHorizontal: scale(20),
  },
  submitButton: {
    minHeight: moderateScale(46),
    marginHorizontal: scale(20),
    marginTop: verticalScale(24),
  },
});

export default DocumentUploadScreen;
