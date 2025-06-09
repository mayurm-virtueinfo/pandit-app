import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { apiService } from '../api/apiService';
import CustomHeader from '../components/CustomHeader';
import { COLORS } from '../theme/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { PoojaRequestParamList } from '../navigation/PoojaRequestNavigator';
import { useNavigation } from '@react-navigation/native';

interface CancellationReason {
  id: number;
  reason: string;
  requiresSpecification?: boolean;
}

type ScreenNavigationProp = StackNavigationProp<
  PoojaRequestParamList,
  'CancellationPolicy'|'RateYourExperience'
>;

const CancellationReasonScreen = () => {
    const navigation = useNavigation<ScreenNavigationProp>();
  const [cancellationReasons, setCancellationReasons] = useState<CancellationReason[]>([]);
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    fetchCancellationReason();
  }, []);

  const fetchCancellationReason = async () => {
    const requests = await apiService.getCancellationReason();
    console.log('Fetched Cancellation Reason Request:', requests);
    setCancellationReasons(requests);
  };

  const handleSubmit = () => {
    const selectedReason = cancellationReasons.find(r => r.id === selectedReasonId);

    if (!selectedReason) {
      Alert.alert('Validation Error', 'Please select a cancellation reason.');
      return;
    }

    if (selectedReason.requiresSpecification && customReason.trim() === '') {
      Alert.alert('Validation Error', 'Please enter your cancellation reason.');
      return;
    }

    // Submit logic here
    console.log('Submitting with:', {
      reasonId: selectedReasonId,
      reasonText: selectedReason.requiresSpecification ? customReason : selectedReason.reason,
    });

    Alert.alert('Success', 'Cancellation submitted successfully.');
  };

    const handleOpenPolicy = () => {
        // Linking.openURL('https://your-cancellation-policy-link.com');
        navigation.navigate('CancellationPolicy');
    };
  

  const showCustomInput =
    cancellationReasons.find(r => r.id === selectedReasonId)?.requiresSpecification;

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={true}
        showMenuButton={false}
        title={'Pooja Cancellation'}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Cancellation Reason</Text>
        <Text style={styles.description}>
          Please note that cancellations are only applicable if made 24 hours prior to the
          scheduled Pooja. If you cancel within this period, You will be charged Rs. 1000 penalty.
        </Text>
        <Text style={styles.policy}>
          Cancellation policy:{' '}
          <Text style={styles.link} onPress={handleOpenPolicy}>
            click here
          </Text>
        </Text>

        <View style={styles.radioGroup}>
          {cancellationReasons.map(reason => (
            <TouchableOpacity
              key={reason.id}
              style={styles.radioOption}
              onPress={() => setSelectedReasonId(reason.id)}
            >
              <View
                style={[
                  styles.radioCircle,
                  selectedReasonId === reason.id && { borderColor: COLORS.primary },
                ]}
              >
                {selectedReasonId === reason.id && (
                  <View style={styles.selectedDot} />
                )}
              </View>
              <Text
                style={[
                  styles.radioText,
                  reason.requiresSpecification && styles.otherText,
                ]}
              >
                {reason.reason}
                {reason.requiresSpecification ? ' (Please Specify)' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {showCustomInput && (
          <TextInput
            style={styles.input}
            placeholder="Enter your cancellation reason"
            value={customReason}
            onChangeText={setCustomReason}
            multiline
          />
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Cancellation</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
};

export default CancellationReasonScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  description: {
    fontSize: 14,
    color: '#4B4B4B',
    marginBottom: 8,
  },
  policy: {
    fontSize: 14,
    color: '#4B4B4B',
    marginBottom: 16,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  radioGroup: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  otherText: {
    color: '#999',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#ECECEC',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
