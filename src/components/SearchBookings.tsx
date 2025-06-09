import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../theme/theme';

const SearchBookings = () => {
  return (
    <View style={styles.container}>
      <Icon name="search-outline" size={20} color={COLORS.textGray} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search bookings"
        placeholderTextColor={COLORS.textGray}
      />
    </View>
  );
};

export default SearchBookings;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.backGroundSecondary,
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 40,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
