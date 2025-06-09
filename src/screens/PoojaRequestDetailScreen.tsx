import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Imported icons
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Imported icons
import Feather from 'react-native-vector-icons/Feather'; // Imported icons
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { COLORS } from '../theme/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { PoojaRequestParamList } from '../navigation/PoojaRequestNavigator';

type ScreenNavigationProp = StackNavigationProp<
  PoojaRequestParamList,
  'ChatMessages'|'PoojaItemList'|'PinVerification'|'CancellationReason'|'RateYourExperience'
>;



const PoojaRequestDetailScreen: React.FC = () => {
    const navigation = useNavigation<ScreenNavigationProp>();

    const handlePinVerify = () => {
        // Navigate to chat screen or perform chat action
        console.log('Pin Verify pressed');
        navigation.navigate('PinVerification');
    };

    const handleChatMessagePress = () => {
        // Navigate to chat screen or perform chat action
        console.log('Chat with Dharmesh pressed');
        navigation.navigate('ChatMessages');
    };
    const handleItemsListPress = () => {
        // Navigate to items list screen or perform items list action
        console.log('View Pooja Items list pressed');
        navigation.navigate('PoojaItemList');
    };
    const handlePanditLocationPress = () => {
        // Navigate to pandit location screen or perform location action
        console.log('Pandit location pressed');
    };
    const handleStartPress = () => {
        // Handle start button press
        console.log('Start Pooja pressed');
    };
    const handleCancelPress = () => {
        // Handle cancel button press
        console.log('Cancel Pooja pressed');
        navigation.navigate('CancellationReason');
    };

    const handleRateYourExperience = () => {
      navigation.navigate('RateYourExperience');
  };
    return (
        <>
            <CustomHeader showBackButton={true} showMenuButton={false} title='Ganesh Chaturthi Pooja' />

            <ScrollView style={styles.container}>
                {/* Header image */}
                <Image
                    source={{ uri: 'https://m.media-amazon.com/images/I/81UGR2phOxL.jpg' }} // Replace with actual URI or local image
                    style={styles.poojaImage}
                />

                {/* Title */}
                <Text style={styles.title}>Ganesh Chaturthi Pooja</Text>

                {/* Details Box */}
                <View style={styles.card}>
                    {/* Date */}
                    <View style={styles.row}>
                        <Ionicons name="calendar-outline" size={20} color="#333" style={styles.icon} />
                        <Text style={styles.text}>Date: 2023-09-19</Text>
                    </View>

                    {/* Time */}
                    <View style={styles.row}>
                        <Ionicons name="time-outline" size={20} color="#333" style={styles.icon} />
                        <Text style={styles.text}>Mahurat: 08:30 AM</Text>
                    </View>

                    {/* Chat */}
                    <TouchableOpacity onPress={handleChatMessagePress} style={styles.row}>
                        <Ionicons name="chatbox-outline" size={20} color="#333" style={styles.icon} />
                        <Text style={styles.link}>Chat with Dharmesh...</Text>
                    </TouchableOpacity>

                    {/* Items List */}
                    <TouchableOpacity  onPress={handleItemsListPress} style={styles.row}>
                        <Feather name="list" size={20} color="#333" style={styles.icon} />
                        <Text style={styles.link}>View Pooja Items list</Text>
                    </TouchableOpacity>

                    {/* Pandit Info */}
                    <TouchableOpacity onPress={handlePanditLocationPress} style={styles.row}>
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} // Replace with actual image
                            style={styles.avatar}
                        />
                        <TouchableOpacity  style={{ flex: 1 }}>
                            <Text style={styles.panditName}>Dharmesh Shah</Text>
                            <Text style={styles.address}>
                                House no. 102, Ganesh Colony, GK Road, Ahemdabad
                            </Text>
                        </TouchableOpacity>
                        <MaterialCommunityIcons name="map-marker-distance" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Pricing Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Pooja Pricing</Text>
                    <View style={styles.rowBetween}>
                        <Text>Ganesh Chaturthi Pooja</Text>
                        <Text>Rs 3000</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text>Pooja Items</Text>
                        <Text>Rs 2000</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.totalText}>Total</Text>
                        <Text style={styles.totalText}>Rs 5000</Text>
                    </View>
                </View>

                {/* Buttons */}
                <TouchableOpacity onPress={handleStartPress} style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePinVerify} style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Pin Verify</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleRateYourExperience}>
                          <Text style={styles.primaryBtnText}>Rate Your Experience</Text>
                        </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelPress} style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </>

    );
};

export default PoojaRequestDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f6f8fa',
    },
    poojaImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontSize: 14,
        color: '#333',
    },
    link: {
        fontSize: 14,
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    panditName: {
        fontWeight: '600',
        fontSize: 14,
        color: '#333',
    },
    address: {
        fontSize: 12,
        color: '#666',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 12,
        color: '#333',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalText: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#000',
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
