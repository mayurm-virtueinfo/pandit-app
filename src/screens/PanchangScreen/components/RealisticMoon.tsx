import React from 'react';
import { Image, View } from 'react-native';
import { Images } from '../../../theme/Images';

interface RealisticMoonProps {
  phase: number; // 0.0 to 1.0 (Fallback)
  size?: number;
  date?: string; // For debugging
  displayText?: string; // "Sud 1", "Vad 5", etc.
}

const RealisticMoon: React.FC<RealisticMoonProps> = ({
  phase,
  size = 20,
  date,
  displayText,
}) => {
  const MOON_IMAGES = [
    Images.ic_moon_phase_01,
    Images.ic_moon_phase_02,
    Images.ic_moon_phase_03,
    Images.ic_moon_phase_04,
    Images.ic_moon_phase_05,
    Images.ic_moon_phase_06,
    Images.ic_moon_phase_07,
    Images.ic_moon_phase_08,
    Images.ic_moon_phase_09,
    Images.ic_moon_phase_10,
    Images.ic_moon_phase_11,
    Images.ic_moon_phase_12,
    Images.ic_moon_phase_13,
    Images.ic_moon_phase_14,
    Images.ic_moon_phase_15,
    Images.ic_moon_phase_16,
    Images.ic_moon_phase_17,
    Images.ic_moon_phase_18,
    Images.ic_moon_phase_19,
    Images.ic_moon_phase_20,
    Images.ic_moon_phase_21,
    Images.ic_moon_phase_22,
    Images.ic_moon_phase_23,
    Images.ic_moon_phase_24,
    Images.ic_moon_phase_25,
    Images.ic_moon_phase_26,
    Images.ic_moon_phase_27,
    Images.ic_moon_phase_28,
    Images.ic_moon_phase_29,
    Images.ic_moon_phase_30,
  ];

  let imageIndex = 0;
  let calculationMethod = 'Phase (Fallback)';

  if (displayText) {
    const lowerText = displayText.toLowerCase();

    // Check for Special Days first
    if (lowerText.includes('amas') || lowerText.includes('amavasya')) {
      imageIndex = 29; // Dark Moon (Day 30)
      calculationMethod = 'Special (Amas)';
    } else if (
      lowerText.includes('punam') ||
      lowerText.includes('purnima') ||
      lowerText.includes('poonam')
    ) {
      imageIndex = 14; // Full Moon (Day 15)
      calculationMethod = 'Special (Punam)';
    } else {
      // Parsing "Month Sud/Vad Tithi"
      // e.g., "Magshar Sud 11", "Posh Vad 1"
      try {
        const parts = displayText.trim().split(' ');
        let pakshaFound = '';
        let tithi = -1;

        for (let i = 0; i < parts.length; i++) {
          const partLower = parts[i].toLowerCase();

          if (partLower.includes('sud')) {
            pakshaFound = 'Sud';
          } else if (partLower.includes('vad')) {
            pakshaFound = 'Vad';
          } else if (!isNaN(parseInt(parts[i], 10))) {
            tithi = parseInt(parts[i], 10);
          }
        }

        if (pakshaFound && tithi !== -1) {
          if (pakshaFound === 'Sud') {
            // Sud 1 -> Index 0
            imageIndex = Math.max(0, tithi - 1);
            calculationMethod = `Tithi (Sud ${tithi})`;
          } else if (pakshaFound === 'Vad') {
            // Vad 1 -> Index 15
            imageIndex = Math.max(0, 14 + tithi);
            calculationMethod = `Tithi (Vad ${tithi})`;
          }
        }
      } catch (e) {
        console.warn('Error parsing tithi for moon:', displayText);
      }
    }
  } else {
    // Fallback to Phase logic if displayText is missing
    const validPhase = Math.max(0, Math.min(1, phase));
    imageIndex = Math.floor(validPhase * 29.53);
  }

  // Final Clamp
  imageIndex = Math.max(0, Math.min(29, imageIndex));

  if (date) {
    console.log(
      `Date: ${date} | Method: ${calculationMethod} | Text: "${displayText}" | Index: ${imageIndex}`,
    );
  }

  const moonImage = MOON_IMAGES[imageIndex];

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        source={moonImage}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

export default React.memo(RealisticMoon);
