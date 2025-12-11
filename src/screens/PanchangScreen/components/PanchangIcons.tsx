import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../../theme/theme';

export const PanchangIcon = ({
  name,
  color = COLORS.primary,
  size = 24,
}: {
  name: string;
  color?: string;
  size?: number;
}) => {
  switch (name) {
    case 'tithi': // Moon
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </Svg>
      );
    case 'nakshatra': // Star
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );
    case 'yoga': // Lotus / Flower
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <Path d="M12 8v4" />
          <Path d="M12 16v.01" />
        </Svg>
      );
    case 'karana': // Sun / Chakra
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Circle cx="12" cy="12" r="5" />
          <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </Svg>
      );
    default:
      return null;
  }
};

export const AstronomyIcon = ({
  name,
  color = COLORS.primary,
  size = 24,
}: {
  name: string;
  color?: string;
  size?: number;
}) => {
  switch (name) {
    case 'sunrise':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M12 2v4M4.93 4.93l2.83 2.83M16.24 7.76l2.83-2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 16.24l2.83 2.83" />
          <Path d="M8 12a4 4 0 0 1 8 0" />
          <Path d="M3 17h18" />
        </Svg>
      );
    case 'sunset':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M17 18a5 5 0 0 0-10 0" />
          <Path d="M12 9V2" />
          <Path d="M4.22 10.22l1.42 1.42" />
          <Path d="M1 18h2" />
          <Path d="M21 18h2" />
          <Path d="M18.36 11.64l1.42-1.42" />
          <Path d="M23 22H1" />
          <Path d="M16 5l-4 4-4-4" />
        </Svg>
      );
    case 'moonrise':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M12 2v4M2 12h4M18 12h4" />
          <Path d="M17 18a5 5 0 0 0-10 0" />
          <Path d="M3 22h18" />
          <Path d="M12 12a5 5 0 0 1 5-5" />
        </Svg>
      );
    case 'moonset':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M17 18a5 5 0 0 0-10 0" />
          <Path d="M12 2v4M2 12h4M18 12h4" />
          <Path d="M3 22h18" />
          <Path d="M12 12l4-4-4-4" />
        </Svg>
      );
    default:
      return null;
  }
};
