import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {COLORS, THEMESHADOW} from '../theme/theme';
import Fonts from '../theme/fonts';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import PrimaryButtonOutlined from './PrimaryButtonOutlined';
import PrimaryButton from './PrimaryButton';
import {useTranslation} from 'react-i18next';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface OptionsProps {
  visible: boolean;
  onClose: () => void;
  onApply: (month: string, year: string) => void;
  selectedMonth?: string;
  selectedYear?: string;
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getYearList = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 20; i--) {
    years.push(i.toString());
  }
  return years;
};

const Options: React.FC<OptionsProps> = ({
  visible,
  onClose,
  onApply,
  selectedMonth,
  selectedYear,
}) => {
  const {t} = useTranslation();
  // For "show all data", use empty string for month/year
  const [month, setMonth] = useState(selectedMonth ?? '');
  const [year, setYear] = useState(selectedYear ?? '');

  useEffect(() => {
    setMonth(selectedMonth ?? '');
    setYear(selectedYear ?? '');
  }, [selectedMonth, selectedYear]);

  // On clear, set both to empty string and apply immediately
  const handleClear = () => {
    setMonth('');
    setYear('');
    onApply('', '');
    onClose();
  };

  const handleApply = () => {
    onApply(month, year);
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.optionsContainer, THEMESHADOW.shadow]}>
              <View style={styles.header}>
                <Text style={styles.filterText}>{t('filter')}</Text>
                <TouchableOpacity
                  onPress={handleClear}
                  accessible={true}
                  accessibilityRole="button">
                  <Text style={styles.clearText}>{t('clear')}</Text>
                </TouchableOpacity>
              </View>

              {/* Month Picker */}
              <View style={styles.inputField}>
                <View style={styles.titleContainer}>
                  <Text style={styles.inputLabel}>
                    {t('select')} {t('month')}
                  </Text>
                </View>
                <View style={styles.inputArea}>
                  <Picker
                    selectedValue={month}
                    onValueChange={itemValue => setMonth(itemValue)}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primaryTextDark}
                    mode="dropdown">
                    <Picker.Item
                      key="all-months"
                      label="All Months"
                      value=""
                      style={styles.pickerItem}
                    />
                    {monthNames.map(m => (
                      <Picker.Item
                        key={m}
                        label={m}
                        value={m}
                        style={styles.pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Year Picker */}
              <View style={styles.inputField}>
                <View style={styles.titleContainer}>
                  <Text style={styles.inputLabel}>{t('select_year')}</Text>
                </View>
                <View style={styles.inputArea}>
                  <Picker
                    selectedValue={year}
                    onValueChange={itemValue => setYear(itemValue)}
                    style={styles.picker}
                    dropdownIconColor={COLORS.primaryTextDark}
                    mode="dropdown">
                    <Picker.Item
                      key="all-years"
                      label="All Years"
                      value=""
                      style={styles.pickerItem}
                    />
                    {getYearList().map(y => (
                      <Picker.Item
                        key={y}
                        label={y}
                        value={y}
                        style={styles.pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <PrimaryButtonOutlined
                  title={t('cancel')}
                  onPress={onClose}
                  style={styles.cancelButton}
                />
                <PrimaryButton
                  title={t('apply')}
                  onPress={handleApply}
                  style={styles.applyButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    width: Math.min(SCREEN_WIDTH - scale(40), scale(320)),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: scale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  filterText: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.primaryTextDark,
  },
  clearText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.gradientEnd,
  },
  inputField: {
    marginBottom: verticalScale(20),
  },
  titleContainer: {
    marginBottom: verticalScale(4),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.inputLabelText,
    letterSpacing: -0.28,
  },
  inputArea: {
    height: verticalScale(46),
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
  },
  picker: {
    height: verticalScale(46),
    color: COLORS.primaryTextDark,
    fontFamily: Fonts.Sen_Medium,
  },
  pickerItem: {
    backgroundColor: COLORS.white, // Explicitly set white background for dropdown items
    color: COLORS.primaryTextDark,
    fontFamily: Fonts.Sen_Medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  cancelButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});

export default Options;
