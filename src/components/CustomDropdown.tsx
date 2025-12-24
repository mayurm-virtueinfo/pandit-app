import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {COLORS} from '../theme/theme';
import Fonts from '../theme/fonts';
import {Dropdown} from 'react-native-element-dropdown';

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  items,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  label,
  error,
  required,
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{color: COLORS.error}}> *</Text>}
        </Text>
      )}
      <Dropdown
        style={[styles.dropdown, error ? styles.dropdownError : null]}
        data={items}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={selectedValue}
        onChange={item => onSelect(item.value)}
        placeholderStyle={styles.dropdownText}
        selectedTextStyle={styles.dropdownText}
        itemTextStyle={styles.dropdownItemText}
        containerStyle={styles.dropdownList}
        iconColor={COLORS.textPrimary}
        iconStyle={{width: 20, height: 20}}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 5,
  },
  label: {
    color: COLORS.inputLabelText,
    fontFamily: Fonts.Sen_Medium,
    fontSize: moderateScale(14),
    marginBottom: moderateScale(5),
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: COLORS.inputBoder,
    padding: moderateScale(10),
  },
  dropdownError: {
    borderColor: COLORS.error, // Red border for error
  },
  dropdownText: {
    fontFamily: Fonts.Sen_Medium,
    fontSize: moderateScale(14),
    color: COLORS.textPrimary,
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginTop: moderateScale(5),
    maxHeight: moderateScale(150),
  },
  dropdownItemText: {
    fontFamily: Fonts.Sen_Regular,
    fontSize: moderateScale(14),
    color: COLORS.textPrimary,
  },
  errorText: {
    color: COLORS.error, // Red text for error message
    fontFamily: Fonts.Sen_Regular,
    fontSize: 12,
    marginTop: 2,
  },
});
