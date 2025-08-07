import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {HomeStackParamList} from '../../navigation/HomeStack/HomeStack';
import {useCommonToast} from '../../common/CommonToast';
import {COLORS} from '../../theme/theme';
import CustomHeader from '../../components/CustomHeader';
import PrimaryButton from '../../components/PrimaryButton';
import CustomModal from '../../components/CustomModal';
import Fonts from '../../theme/fonts';
import CancellationPolicyModal from '../../components/CancellationPolicyModal';
import {postCancelBooking} from '../../api/apiService';

interface CancellationReason {
  key: string;
  label: string;
  requiresSpecification?: boolean;
}

const PANDIT_CANCELLATION_REASONS: CancellationReason[] = [
  {key: 'pandit_unavailable', label: 'Pandit: Unavailable'},
  {key: 'pandit_emergency', label: 'Pandit: Emergency'},
  {key: 'pandit_scheduling_conflict', label: 'Pandit: Scheduling Conflict'},
  {
    key: 'pandit_other',
    label: 'Pandit: Other (Pandit-provided)',
    requiresSpecification: true,
  },
];

const PujaCancellationScreen = () => {
  const inset = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation<HomeStackParamList>();
  const {t} = useTranslation();
  const {id} = route.params as any;
  const [cancellationReasons] = useState<CancellationReason[]>(
    PANDIT_CANCELLATION_REASONS,
  );
  const [selectedReasonKey, setSelectedReasonKey] = useState<string | null>(
    null,
  );
  const [customReason, setCustomReason] = useState('');
  const [
    isCancellationPolicyModalVisible,
    setIsCancellationPolicyModalVisible,
  ] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const {showErrorToast, showSuccessToast} = useCommonToast();

  const handleSubmit = () => {
    const selectedReason = cancellationReasons.find(
      r => r.key === selectedReasonKey,
    );
    if (!selectedReason) {
      showErrorToast(t('please_select_cancellation_reason'));
      return;
    }
    if (selectedReason.requiresSpecification && customReason.trim() === '') {
      showErrorToast(t('please_enter_cancellation_reason'));
      return;
    }
    setIsConfirmModalVisible(true);
  };

  const handleConfirmCancellation = async () => {
    setIsConfirmModalVisible(false);
    setIsSubmitting(true);
    const selectedReason = cancellationReasons.find(
      r => r.key === selectedReasonKey,
    );
    try {
      const payload: any = {
        cancellation_reason_type: selectedReason?.key,
        reason: selectedReason?.label,
        ...(selectedReason?.requiresSpecification && {
          other_reason: customReason,
        }),
      };
      console.log('payload', payload);
      await postCancelBooking(id, payload);
      showSuccessToast(t('cancellation_submitted_successfully'));

      // Notification removed

      navigation.replace('HomeScreen');
    } catch (error: any) {
      showErrorToast(
        error?.message || 'Failed to submit cancellation. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showCustomInput = cancellationReasons.find(
    r => r.key === selectedReasonKey,
  )?.requiresSpecification;

  const renderReasonOption = (reason: CancellationReason, index: number) => (
    <View key={reason.key}>
      <TouchableOpacity
        style={styles.reasonOption}
        onPress={() => setSelectedReasonKey(reason.key)}
        activeOpacity={0.7}>
        <Text style={styles.reasonText}>{reason.label}</Text>
        <Ionicons
          name={
            selectedReasonKey === reason.key
              ? 'checkmark-circle-outline'
              : 'ellipse-outline'
          }
          size={moderateScale(24)}
          color={
            selectedReasonKey === reason.key
              ? COLORS.gradientEnd
              : COLORS.inputBoder
          }
        />
      </TouchableOpacity>
      {index < cancellationReasons.length - 1 && (
        <View style={styles.separator} />
      )}
    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: inset.top}]}>
      <CustomHeader title={t('puja_cancellation')} showBackButton={true} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.heading}>{t('cancellation_reason')}</Text>
          <Text style={styles.warningText}>
            {t('descriprion_for_cancel_puja')}
          </Text>
          <View style={styles.reasonsContainer}>
            {cancellationReasons.map((reason, index) =>
              renderReasonOption(reason, index),
            )}
          </View>
          {showCustomInput && (
            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                placeholder={t('enter_your_cancellation_reason')}
                placeholderTextColor={COLORS.inputLabelText}
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                textAlignVertical="top"
              />
            </View>
          )}
          <TouchableOpacity
            onPress={() => setIsCancellationPolicyModalVisible(true)}
            style={styles.policyLinkContainer}>
            <Text style={styles.policyLinkText}>
              {t('cancellation_policy')}
            </Text>
          </TouchableOpacity>
          <PrimaryButton
            title={isSubmitting ? t('submitting') : t('submit_cancellation')}
            onPress={handleSubmit}
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
            disabled={isSubmitting}
          />
          {isSubmitting && (
            <View style={{marginTop: 16, alignItems: 'center'}}>
              <ActivityIndicator
                size="small"
                color={COLORS.primaryBackgroundButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <CancellationPolicyModal
        visible={isCancellationPolicyModalVisible}
        onClose={() => setIsCancellationPolicyModalVisible(false)}
      />

      <CustomModal
        visible={isConfirmModalVisible}
        title={t('confirm_cancellation') || 'Confirm Cancellation'}
        message={
          t('are_you_sure_you_want_to_cancel') ||
          'Are you sure you want to cancel this booking?'
        }
        confirmText={t('yes') || 'Yes'}
        cancelText={t('no') || 'No'}
        onConfirm={handleConfirmCancellation}
        onCancel={() => setIsConfirmModalVisible(false)}
      />
    </View>
  );
};

export default PujaCancellationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  content: {
    flex: 1,
    paddingTop: verticalScale(24),
    paddingHorizontal: scale(24),
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  heading: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(6),
  },
  warningText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.inputLabelText,
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(17),
    marginRight: scale(21),
  },
  reasonsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(24),
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 3,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: verticalScale(14),
  },
  reasonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    flex: 1,
    letterSpacing: -0.33,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginHorizontal: verticalScale(14),
  },
  customInputContainer: {
    marginBottom: verticalScale(24),
  },
  customInput: {
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: COLORS.inputBoder,
    paddingHorizontal: scale(14),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(74),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
    letterSpacing: -0.14,
    minHeight: verticalScale(100),
  },
  policyLinkContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  policyLinkText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryBackgroundButton,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primaryBackgroundButton,
    borderRadius: moderateScale(10),
    minHeight: verticalScale(46),
    alignSelf: 'stretch',
    marginTop: 0,
  },
  submitButtonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    textTransform: 'uppercase',
    letterSpacing: -0.15,
    lineHeight: moderateScale(21),
  },
});
