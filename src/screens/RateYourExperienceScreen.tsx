// RateYourExperienceScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
// import { COLORS } from '../constants/colors';
// import { CustomHeader } from '../components/CustomHeader';
import { AirbnbRating } from 'react-native-ratings';
import { COLORS } from '../theme/theme';
import CustomHeader from '../components/CustomHeader';

const RateYourExperienceScreen = () => {
  const [rating, setRating] = useState(0);

  const handleRatingCompleted = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    console.log('Rating submitted:', rating);
    // Submit logic here
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={true}
        showMenuButton={false}
        title={'Rate Your Experience'}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.successText}>Booking Completed{'\n'}Successfully!</Text>

        <View style={styles.imageCard}>
          <Image
            source={{
              uri: 'https://randomuser.me/api/portraits/men/32.jpg', // Example image URL
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.nameText}>Dharmesh Shah</Text>
        </View>

        <Text style={styles.questionText}>How was your experience?</Text>

        <View style={styles.ratingBox}>
          <AirbnbRating
            count={5}
            reviews={[]}
            defaultRating={0}
            size={40}
            showRating={false}
            onFinishRating={handleRatingCompleted}
            selectedColor={COLORS.primary}
            starContainerStyle={{ justifyContent: 'center' }}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Rating</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RateYourExperienceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 10,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 16,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 180,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    padding: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  ratingBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
