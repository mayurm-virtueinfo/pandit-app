import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { COLORS } from '../theme/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { AstroRequestParamList } from '../navigation/AstroRequestNavigator';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { COLORS } from '../theme/colors';


type ScreenNavigationProp = StackNavigationProp<
  AstroRequestParamList,
  'ChatMessages'
>;
const AstroRequestScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const handleAccept = () => {
    // Add accept logic here
    console.log('Accepted');
    navigation.navigate('ChatMessages'); // Navigate to chat screen after accepting 
  };

  const handleReject = () => {
    // Add reject logic here
    console.log('Rejected');
  };

  return (
    <View style={[styles.container, { marginBottom: insets.bottom }]}>
      <CustomHeader showBackButton={false} showMenuButton={true} title={'Astro Request'} />

      <View style={styles.content}>
        <Image
          source={{uri:'https://www.drikpanchang.com/images/page-showcase/270x180/kundali_milan.jpg'}} // Replace with your actual image path
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Kundali matching</Text>

        <View style={styles.detailBlock}>
          <Text style={styles.label}>Name: <Text style={styles.value}>Shailesh Vyas</Text></Text>
          <Text style={styles.label}>City: <Text style={styles.value}>Mumbai</Text></Text>
          <Text style={styles.label}>DOB: <Text style={styles.value}>13-Dec-2024</Text></Text>
          <Text style={styles.label}>Time of birth: <Text style={styles.value}>8:40AM</Text></Text>
        </View>

        <Text style={styles.description}>
          Mr. Shailesh has requested for the service......
        </Text>

        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AstroRequestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  detailBlock: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontWeight: '400',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 24,
  },
  acceptButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  rejectButton: {
    width: '100%',
    backgroundColor: '#eee',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
});
