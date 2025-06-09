import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { COLORS } from '../theme/theme';
import AllRequestsScreen from './AllRequestsScreen';
import PendingRequestsScreen from './PendingRequestsScreen';
import AcceptedRequestsScreen from './AcceptedRequestsScreen';
import CustomHeader from '../components/CustomHeader';

const Tab = createMaterialTopTabNavigator();


const PoojaBookingsScreen: React.FC = () => {

    return (
        <View style={styles.container}>
            <CustomHeader showBackButton={false} showMenuButton={true} title={'Pooja Bookings'}/>
            <Tab.Navigator
                screenOptions={{
                    tabBarIndicatorStyle: {
                        backgroundColor: COLORS.primary, // Bottom border color of selected tab
                        height: 1, // Thickness of bottom border
                    },
                    //   headerShown: false, // Usually handled by Drawer or Stack
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: 'gray',
                }}>
                <Tab.Screen name="All" component={AllRequestsScreen} />
                <Tab.Screen name="Pending" component={PendingRequestsScreen} />
                <Tab.Screen name="Accepted" component={AcceptedRequestsScreen} />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 20,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
    },
    tabContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    validateButton: {
        backgroundColor: '#00BCD4',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
    },
});

export default PoojaBookingsScreen;