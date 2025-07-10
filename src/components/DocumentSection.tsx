import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Image} from 'react-native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../theme/theme';
import Fonts from '../theme/fonts';
import PrimaryButtonOutlined from './PrimaryButtonOutlined';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure you have this package installed

interface DocumentSectionProps {
  label: string;
  buttonText: string;
  isRequired: boolean;
  isUploaded: boolean;
  documentType: string;
  onUpload: () => void;
  documentName: string | null;
  isLoading?: boolean;
  documentUrl?: string | null;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({
  label,
  buttonText,
  isRequired,
  isUploaded,
  documentType,
  onUpload,
  documentName,
  isLoading = false,
  documentUrl,
}) => {
  const isImage = documentName?.match(/\.(jpg|jpeg|png|gif)$/i);

  return (
    <View style={styles.documentSection}>
      <Text style={styles.documentLabel}>
        {label}
        {isRequired && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>

      {isUploaded && documentName ? (
        <View style={styles.documentPreviewContainer}>
          {isImage && documentUrl ? (
            <Image
              source={{uri: documentUrl}}
              style={styles.documentImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.pdfIconContainer}>
              <Icon
                name="picture-as-pdf"
                size={moderateScale(60)}
                color={COLORS.primary}
              />
            </View>
          )}
        </View>
      ) : (
        <PrimaryButtonOutlined
          title={buttonText}
          onPress={onUpload}
          disabled={isLoading}
          style={styles.uploadButton}
          textStyle={styles.uploadButtonText}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  documentSection: {
    // marginBottom: verticalScale(20),
  },
  documentLabel: {
    color: COLORS.lighttext,
    fontSize: scale(14),
    fontFamily: Fonts.Sen_Medium,
    marginTop: verticalScale(20),
  },
  requiredAsterisk: {
    color: COLORS.lighttext,
    fontFamily: Fonts.Sen_Medium,
  },
  uploadButton: {
    minHeight: moderateScale(46),
  },
  uploadButtonText: {
    fontSize: scale(15),
    fontFamily: Fonts.Sen_Medium,
  },
  documentPreviewContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    marginTop: verticalScale(8),
  },
  documentImage: {
    width: '100%',
    height: verticalScale(150),
    borderRadius: moderateScale(8),
  },
  pdfIconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: moderateScale(8),
  },
  loadingContainer: {
    position: 'absolute',
    right: scale(10),
    top: '50%',
  },
});

export default DocumentSection;
