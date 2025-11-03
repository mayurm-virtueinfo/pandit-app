import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {COLORS, THEMESHADOW} from '../theme/theme';
import Fonts from '../theme/fonts';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';
import PrimaryButtonOutlined from './PrimaryButtonOutlined';
import {useTranslation} from 'react-i18next';

interface CodeVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

const CodeVerificationModal: React.FC<CodeVerificationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onCancel,
}) => {
  const {t} = useTranslation();

  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Clear error on input
    if (error) setError(null);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join('');
    if (fullCode.length === 4 && code.every(d => d !== '')) {
      setError(null);
      onSubmit(fullCode);
      // Reset code after submission
      setCode(['', '', '', '']);
    } else {
      setError(
        t('Please_enter_valid_code') || 'Please enter a valid 4-digit code',
      );
    }
  };

  const handleCancel = () => {
    setCode(['', '', '', '']);
    setError(null);
    onCancel();
  };

  const handleModalClose = () => {
    setCode(['', '', '', '']);
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleModalClose}>
      <TouchableWithoutFeedback onPress={handleModalClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}>
              <View style={[styles.modalContainer, THEMESHADOW.shadow]}>
                <View style={styles.contentContainer}>
                  <View style={styles.headerContainer}>
                    <Text style={styles.title}>{t('code_verification')}</Text>
                    <Text style={styles.description}>
                      {t('Please_enter_the_4-digit')}
                    </Text>
                  </View>

                  <View style={styles.codeInputContainer}>
                    {code.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={ref => (inputRefs.current[index] = ref)}
                        style={[
                          styles.codeInput,
                          focusedIndex === index && styles.codeInputFocused,
                          error && styles.codeInputError,
                        ]}
                        value={digit}
                        onChangeText={value => handleCodeChange(value, index)}
                        onKeyPress={e => handleKeyPress(e, index)}
                        keyboardType="numeric"
                        maxLength={1}
                        textAlign="center"
                        selectTextOnFocus
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                      />
                    ))}
                  </View>

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <PrimaryButton
                    title={t('submit')}
                    onPress={handleSubmit}
                    disabled={code.join('').length !== 4}
                  />

                  <PrimaryButtonOutlined
                    title={t('cancel')}
                    onPress={handleCancel}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    maxWidth: moderateScale(320),
    width: '90%',
    marginHorizontal: moderateScale(20),
  },
  contentContainer: {
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(27),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    fontWeight: '600',
    color: COLORS.primaryTextDark,
    textAlign: 'center',
  },
  description: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
    color: COLORS.primaryTextDark,
    textAlign: 'center',
    marginTop: verticalScale(17),
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  codeInput: {
    width: moderateScale(50),
    height: moderateScale(46),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: COLORS.inputBoder,
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    textAlign: 'center',
    backgroundColor: COLORS.white,
  },
  codeInputFocused: {
    borderColor: COLORS.primaryBackgroundButton,
    shadowColor: COLORS.primaryBackgroundButton,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  codeInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Medium,
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primaryBackgroundButton,
    borderRadius: moderateScale(10),
    height: moderateScale(46),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  submitButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
    color: COLORS.primaryTextDark,
    textTransform: 'uppercase',
  },
  cancelButton: {
    borderRadius: moderateScale(10),
    height: moderateScale(46),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBackgroundButton,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    fontWeight: '500',
    color: COLORS.primaryTextDark,
    textTransform: 'uppercase',
  },
});

export default CodeVerificationModal;
