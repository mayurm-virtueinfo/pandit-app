import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ModalProps,
} from 'react-native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../theme/theme';
import Fonts from '../theme/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

interface CancellationPolicyModalProps extends Partial<ModalProps> {
  visible: boolean;
  onClose: () => void;
}

const CancellationPolicyModal: React.FC<CancellationPolicyModalProps> = ({
  visible,
  onClose,
  ...modalProps
}) => {
  const {t, i18n} = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...modalProps}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.headerTitle}>{t('cancellation_policy')}</Text>
          <View style={styles.policyContent}>
            <Text style={styles.policyText}>
              1. Cancellation is subject to management and can change policy
              anytime without prior notice.
            </Text>
            <Text style={styles.policyText}>
              2. If you cancel booking 48 hrs prior then you would be availed
              full refund in form of points.
            </Text>
            <Text style={styles.policyText}>
              3. If you cancel booking before 24 hrs prior then you would be
              availed part refund of 70% in form of points.
            </Text>
            <Text style={styles.policyText}>
              4. The service fee of 5% is not refundable in any case.
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeButtonBg}>
              <Ionicons name="close" size={24} color={COLORS.primaryTextDark} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(10),
  },
  policyContent: {},
  policyText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(10),
  },
  closeButton: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
    width: scale(30),
    height: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonBg: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: COLORS.pujaBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.primaryTextDark,
  },
});

export default CancellationPolicyModal;
