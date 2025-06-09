// components/StarRating.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface StarRatingProps {
  rating: number; // e.g. 3.5
  maxRating?: number; // default: 5
  onRatingChange?: (rating: number) => void;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  allowHalfRating?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 40,
  activeColor = '#F59E0B', // Orange
  inactiveColor = '#D1D5DB', // Gray
  allowHalfRating = true,
}) => {
  const handlePress = (index: number, isHalf: boolean) => {
    if (!onRatingChange) return;
    const newRating = allowHalfRating ? index + (isHalf ? 0.5 : 1) : index + 1;
    onRatingChange(newRating);
  };

  return (
    <View style={styles.starContainer}>
      {[...Array(maxRating)].map((_, i) => {
        const full = i + 1 <= rating;
        const half = i + 0.5 === rating;

        return (
          <View key={i} style={styles.starWrapper}>
            <TouchableOpacity
              style={styles.starHalf}
              onPress={() => handlePress(i, true)}
              activeOpacity={0.7}
            >
              <Icon
                name={half || full ? 'star-half-full' : 'star-o'}
                size={size}
                color={half || full ? activeColor : inactiveColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.starHalf}
              onPress={() => handlePress(i, false)}
              activeOpacity={0.7}
            >
              <Icon
                name={full ? 'star' : 'star-o'}
                size={size}
                color={full ? activeColor : inactiveColor}
              />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starWrapper: {
    flexDirection: 'row',
  },
  starHalf: {
    width: 20,
    alignItems: 'center',
  },
});
