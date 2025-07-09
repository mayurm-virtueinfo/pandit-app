import React, {useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {COLORS, FONTS, THEMESHADOW} from '../theme/theme';
import Fonts from '../theme/fonts';
import Icon from 'react-native-vector-icons/Feather';

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
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  items,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  const renderItem = ({item}: {item: DropdownItem}) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        onSelect(item.value);
        setIsOpen(false);
      }}>
      <Text style={styles.dropdownItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.dropdown, isOpen && styles.dropdownActive]}
        onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.dropdownText}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textPrimary}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.dropdownList, THEMESHADOW.shadow]}>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.value}
            style={styles.flatList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    color: COLORS.inputLabelText,
    fontFamily: Fonts.Sen_Medium,
    fontSize: 14,
    marginBottom: moderateScale(5),
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: COLORS.inputBoder,
    padding: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownActive: {
    borderColor: COLORS.primary,
  },
  dropdownText: {
    fontFamily: Fonts.Sen_Regular,
    fontSize: moderateScale(12),
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
  dropdownItem: {
    padding: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  dropdownItemText: {
    fontFamily: Fonts.Sen_Regular,
    fontSize: moderateScale(14),
    color: COLORS.textPrimary,
  },
  flatList: {
    flexGrow: 0,
  },
});

export default CustomDropdown;
