import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onPress?: () => void;
  disabled?: boolean;
  color?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
  disabled = false,
  color = '#007AFF',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.container}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: color,
            backgroundColor: checked ? color : '#fff',
          },
        ]}
      >
        {checked && <MaterialIcons name="check" size={18} color="#fff" />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Checkbox;
