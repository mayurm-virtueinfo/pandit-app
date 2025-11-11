import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale } from 'react-native-size-matters';
import { CustomeSelectorDataOption, poojaDataOption } from '../types/cityTypes';
import { COLORS, THEMESHADOW } from '../theme/theme';
import Fonts from '../theme/fonts';

const isCustomeSelectorDataOption = (
  item: CustomeSelectorDataOption | poojaDataOption,
): item is CustomeSelectorDataOption => 'name' in item;

interface CustomeMultiSelectorProps {
  data: (CustomeSelectorDataOption | poojaDataOption)[];
  selectedDataIds: number[];
  onDataSelect: (dataId: number) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  containerStyle?: any;
  isMultiSelect?: boolean;
  onSearch?: (text: string) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  loadingMore?: boolean;
}

const CustomeMultiSelector: React.FC<CustomeMultiSelectorProps> = ({
  data,
  selectedDataIds,
  onDataSelect,
  searchPlaceholder,
  showSearch = true,
  containerStyle,
  isMultiSelect = false,
  onSearch,
  onEndReached,
  onEndReachedThreshold = 0.3,
  loadingMore = false,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  // console.log('loadingMore', loadingMore);
  const getDisplayName = (
    item: CustomeSelectorDataOption | poojaDataOption,
  ): string => (isCustomeSelectorDataOption(item) ? item.name : item.title);

  const handleSearchChange = (text: string) => {
    setLocalSearch(text);
    onSearch?.(text);
  };

  const handleItemPress = (id: number) => {
    if (isMultiSelect) onDataSelect(id);
    else onDataSelect(id);
  };

  const renderItem = ({
    item,
    index,
  }: ListRenderItemInfo<CustomeSelectorDataOption | poojaDataOption>) => (
    <View>
      <TouchableOpacity
        style={styles.cityItem}
        onPress={() => handleItemPress(item.id)}
      >
        <Text style={styles.cityName}>{getDisplayName(item)}</Text>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleItemPress(item.id)}
        >
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

      {/* Separator (except after last item) */}
      {index < data.length - 1 && <View style={styles.citySeparator} />}
    </View>
  );

  // The loader should be at the FlatList bottom as footer component.
  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    ) : (
      <View style={{ height: moderateScale(10) }} />
    );

  return (
    <View style={[styles.container, containerStyle, THEMESHADOW.shadow]}>
      {showSearch && (
        <>
          <View style={styles.searchContainer}>
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
              value={localSearch}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.separator} />
        </>
      )}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={i => i.id.toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.7} // ← Better
        ListFooterComponent={renderFooter}
        bounces={true}
        overScrollMode="always"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(14),
  },
  searchIcon: { marginRight: moderateScale(5) },
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
    // paddingVertical: moderateScale(12),
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
  // Loader at FlatList footer for pagination
  footerLoader: {
    paddingVertical: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Retain overlay style in case needed elsewhere, but not used here
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFFAA',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default CustomeMultiSelector;
