import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface RadioButtonProps {
  selected: boolean;
  color?: string;
  size?: number;
  onPress?: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ selected, color = '#007AFF', size = 20, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.outerCircle,
          {
            borderColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.innerCircle,
              {
                backgroundColor: color,
                width: size / 2,
                height: size / 2,
                borderRadius: size / 4,
              },
            ]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerCircle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  innerCircle: {
    backgroundColor: '#007AFF',
  },
});

export default RadioButton;
