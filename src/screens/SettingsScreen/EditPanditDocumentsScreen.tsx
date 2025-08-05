import React, {useEffect, useState} from 'react';
import {View, StatusBar, ScrollView, StyleSheet, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import CustomHeader from '../../components/CustomHeader';
import {COLORS} from '../../theme/theme';
import PrimaryButton from '../../components/PrimaryButton';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import DocumentSection from '../../components/DocumentSection';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {getPanditDocuments, putPanditDocuments} from '../../api/apiService';
import {useCommonToast} from '../../common/CommonToast';

interface DocumentUploadState {
  idProof: boolean;
  panCard: boolean;
  electricityBill: boolean;
  certifications: boolean;
}

interface DocumentInfo {
  file: any;
  name: string | null;
  url: string | null;
}

const EditPanditDocumentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {showErrorToast, showSuccessToast} = useCommonToast();

  // Store the original document URLs fetched from API
  const [originalDocumentUrls, setOriginalDocumentUrls] = useState<{
    id_proof: string | null;
    pan_card: string | null;
    electricity_bill: string | null;
    certifications: string | null;
  }>({
    id_proof: null,
    pan_card: null,
    electricity_bill: null,
    certifications: null,
  });

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
    idProof: {name: null, url: null, file: undefined},
    panCard: {name: null, url: null, file: undefined},
    electricityBill: {name: null, url: null, file: undefined},
    certifications: {name: null, url: null, file: undefined},
  });

  const [loadingDocument, setLoadingDocument] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track if a document has been changed (uploaded/removed)
  const [changedDocuments, setChangedDocuments] = useState<{
    [key in keyof DocumentUploadState]: boolean;
  }>({
    idProof: false,
    panCard: false,
    electricityBill: false,
    certifications: false,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response: any = await getPanditDocuments();
      console.log('response', response.data);
      const documents = response?.data?.document;
      const docInfo: any = {
        idProof: {
          name: documents?.id_proof
            ? documents.id_proof.split('/').pop()
            : null,
          url: documents?.id_proof || null,
          file: undefined,
        },
        panCard: {
          name: documents?.pan_card
            ? documents.pan_card.split('/').pop()
            : null,
          url: documents?.pan_card || null,
          file: undefined,
        },
        electricityBill: {
          name: documents?.electricity_bill
            ? documents.electricity_bill.split('/').pop()
            : null,
          url: documents?.electricity_bill || null,
          file: undefined,
        },
        certifications: {
          name: documents?.certifications
            ? documents.certifications.split('/').pop()
            : null,
          url: documents?.certifications || null,
          file: undefined,
        },
      };
      setDocumentInfo(docInfo);
      setUploadedDocuments({
        idProof: !!docInfo.idProof.url,
        panCard: !!docInfo.panCard.url,
        electricityBill: !!docInfo.electricityBill.url,
        certifications: !!docInfo.certifications.url,
      });
      setChangedDocuments({
        idProof: false,
        panCard: false,
        electricityBill: false,
        certifications: false,
      });
      setOriginalDocumentUrls({
        id_proof: documents?.id_proof || null,
        pan_card: documents?.pan_card || null,
        electricity_bill: documents?.electricity_bill || null,
        certifications: documents?.certifications || null,
      });
    } catch (error) {
      showErrorToast(t('failed_to_fetch_documents'));
      // Optionally log error for debugging
      console.error('Failed to fetch documents:', error);
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
        if (!document.uri || !document.type || !document.name)
          throw new Error(t('invalid_document'));
        setUploadedDocuments(prev => ({
          ...prev,
          [documentType]: true,
        }));
        setDocumentInfo(prev => ({
          ...prev,
          [documentType]: {
            name: document.name || 'Selected Document',
            file: document,
            url: null,
          },
        }));
        setChangedDocuments(prev => ({
          ...prev,
          [documentType]: true,
        }));
        setLoadingDocument(null);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return;
      showErrorToast(t('failed_to_pick_document'));
      setLoadingDocument(null);
    }
  };

  const handleRemoveDocument = (documentType: keyof DocumentUploadState) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [documentType]: false,
    }));
    setDocumentInfo(prev => ({
      ...prev,
      [documentType]: {
        name: null,
        url: null,
        file: undefined,
      },
    }));
    setChangedDocuments(prev => ({
      ...prev,
      [documentType]: true,
    }));
  };

  // Helper: Map documentInfo/changedDocuments to API keys
  const docTypeToApiKey = {
    idProof: 'id_proof',
    panCard: 'pan_card',
    electricityBill: 'electricity_bill',
    certifications: 'certifications',
  };

  // This function is rewritten to match the curl request:
  // - Always send all 4 fields as multipart/form-data
  // - If a file is selected, send the file
  // - If not, send the original value from GET if not changed, or "" if removed
  // - No need to send original URL, only file or value
  const handleSubmit = async () => {
    if (isSubmitting || loadingDocument) return;

    const requiredDocuments = ['idProof', 'panCard'];
    const missingRequired = requiredDocuments.filter(
      doc => !uploadedDocuments[doc as keyof DocumentUploadState],
    );
    if (missingRequired.length > 0) {
      showErrorToast(t('please_upload_all_required_documents'));
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    (Object.keys(documentInfo) as (keyof DocumentUploadState)[]).forEach(
      docType => {
        const apiKey = docTypeToApiKey[docType];
        const info = documentInfo[docType];
        const changed = changedDocuments[docType];
        const originalUrl =
          originalDocumentUrls[apiKey as keyof typeof originalDocumentUrls];

        if (__DEV__) {
          console.log(`Processing ${docType} (apiKey: ${apiKey})`, {
            info,
            changed,
            originalUrl,
          });
        }

        if (info.file && info.file.uri) {
          const fileObj = {
            uri:
              Platform.OS === 'ios' && info.file.uri.startsWith('file://')
                ? info.file.uri
                : info.file.uri,
            type: info.file.type || 'image/jpeg',
            name: info.file.name || `${apiKey}_${Date.now()}.jpg`,
          };
          if (__DEV__) {
            console.log(`Appending file for ${apiKey}:`, fileObj);
          }
          formData.append(apiKey, fileObj as any);
        } else if (!changed && originalUrl) {
          if (__DEV__) {
            console.log(`Appending original URL for ${apiKey}:`, originalUrl);
          }
          formData.append(apiKey, originalUrl);
        } else {
          if (__DEV__) {
            console.log(`Appending empty string for ${apiKey}`);
          }
          formData.append(apiKey, '');
        }
      },
    );

    try {
      console.log('formData', JSON.stringify(formData));
      const response = await putPanditDocuments(formData);
      console.log('API Response:', JSON.stringify(response));
      if (response && response.success) {
        showSuccessToast(t('documents_updated_successfully'));
        await fetchDocuments();
        if (navigation && typeof navigation.goBack === 'function') {
          navigation.goBack();
        }
      } else {
        showErrorToast(
          response?.message ||
            response?.detail ||
            t('failed_to_update_documents'),
        );
      }
    } catch (error: any) {
      console.log('API Error:', error.response?.data || error.message);
      let errorMessage = t('failed_to_update_documents_please_try_again');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors)
          .flat()
          .join('\n');
      }
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBackground}
      />
      <CustomHeader title="Documents" showBackButton={true} />
      <View style={styles.content}>
        <ScrollView
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
              onRemove={() => handleRemoveDocument('idProof')}
              showRemove={
                !!(
                  uploadedDocuments.idProof &&
                  (documentInfo.idProof.url || documentInfo.idProof.file)
                )
              }
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
              onRemove={() => handleRemoveDocument('panCard')}
              showRemove={
                !!(
                  uploadedDocuments.panCard &&
                  (documentInfo.panCard.url || documentInfo.panCard.file)
                )
              }
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
              onRemove={() => handleRemoveDocument('electricityBill')}
              showRemove={
                !!(
                  uploadedDocuments.electricityBill &&
                  (documentInfo.electricityBill.url ||
                    documentInfo.electricityBill.file)
                )
              }
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
              onRemove={() => handleRemoveDocument('certifications')}
              showRemove={
                !!(
                  uploadedDocuments.certifications &&
                  (documentInfo.certifications.url ||
                    documentInfo.certifications.file)
                )
              }
            />
          </View>
        </ScrollView>
        <View
          style={[
            styles.bottomButtonContainer,
            {paddingBottom: insets.bottom || moderateScale(16)},
          ]}>
          <PrimaryButton
            title={t('update')}
            onPress={handleSubmit}
            disabled={isSubmitting || !!loadingDocument}
            style={styles.submitButton}
          />
        </View>
      </View>
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
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: moderateScale(24), // To ensure content is not hidden behind button
  },
  formContainer: {
    paddingHorizontal: scale(20),
  },
  submitButton: {
    minHeight: moderateScale(46),
    marginHorizontal: scale(20),
    // marginTop: verticalScale(24), // Remove marginTop, handled by bottomButtonContainer
  },
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: scale(0),
    paddingTop: moderateScale(12),
    // paddingBottom handled inline for safe area
  },
});

export default EditPanditDocumentsScreen;
