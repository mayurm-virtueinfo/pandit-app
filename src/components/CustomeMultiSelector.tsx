import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from 'react-native-size-matters';
import {CustomeSelectorDataOption, poojaDataOption} from '../types/cityTypes';
import {COLORS, THEMESHADOW} from '../theme/theme';
import Fonts from '../theme/fonts';

const isCustomeSelectorDataOption = (
  item: CustomeSelectorDataOption | poojaDataOption,
): item is CustomeSelectorDataOption => {
  return 'name' in item;
};

interface CustomeMultiSelectorProps {
  data: CustomeSelectorDataOption[] | poojaDataOption[];
  selectedDataIds: number[];
  onDataSelect: (dataId: number) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  containerStyle?: any;
  isMultiSelect?: boolean;
}

const CustomeMultiSelector: React.FC<CustomeMultiSelectorProps> = ({
  data,
  selectedDataIds,
  onDataSelect,
  searchPlaceholder,
  showSearch = true,
  containerStyle,
  isMultiSelect = false,
}) => {
  const [searchText, setSearchText] = useState('');

  const getDisplayName = (
    item: CustomeSelectorDataOption | poojaDataOption,
  ): string => {
    return isCustomeSelectorDataOption(item) ? item.name : item.title;
  };

  const filteredData = data.filter(item =>
    getDisplayName(item).toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleItemPress = (dataId: number) => {
    if (isMultiSelect) {
      onDataSelect(dataId);
    } else {
      onDataSelect(dataId);
    }
  };

  const renderCityItem = ({
    item,
    index,
  }: {
    item: CustomeSelectorDataOption | poojaDataOption;
    index: number;
  }) => (
    <View>
      <TouchableOpacity
        style={styles.cityItem}
        onPress={() => handleItemPress(item.id)}>
        <Text style={styles.cityName}>{getDisplayName(item)}</Text>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleItemPress(item.id)}>
          {selectedDataIds.includes(item.id) ? (
            <Ionicons
              name="checkbox-outline"
              size={24}
              color={COLORS.primary}
            />
          ) : (
            <MaterialIcons
              name="check-box-outline-blank"
              size={24}
              color={COLORS.borderColor}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
      {index < filteredData.length - 1 && <View style={styles.citySeparator} />}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle, THEMESHADOW.shadow]}>
      {showSearch && (
        <>
          <View
            style={[
              styles.searchContainer,
              {
                paddingVertical:
                  Platform.OS === 'ios' ? moderateScale(10) : moderateScale(2),
              },
            ]}>
            <MaterialIcons
              name="search"
              size={16}
              color={COLORS.searchbartext}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={COLORS.searchbartext}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <View style={styles.separator} />
        </>
      )}
      <FlatList
        data={filteredData}
        renderItem={renderCityItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(14),
  },
  searchIcon: {
    marginRight: moderateScale(5),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginHorizontal: 0,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(14),
  },
  cityName: {
    flex: 1,
    color: COLORS.primaryTextDark,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    marginRight: moderateScale(8),
  },
  checkboxContainer: {
    padding: moderateScale(8),
    minWidth: moderateScale(44),
    minHeight: moderateScale(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  citySeparator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginLeft: moderateScale(14),
  },
});

export default CustomeMultiSelector;
