import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { COLORS } from '../theme/theme';

const Tab = createMaterialTopTabNavigator();

const AllRequests = () => (
    <View style={styles.tabContainer}>
        <Text>All Requests</Text>
        {/* Add functionality to display all requests */}
    </View>
);

const PendingRequests = () => (
    <View style={styles.tabContainer}>
        <Text>Pending Requests</Text>
        {/* Add functionality to display pending requests */}
    </View>
);

const AcceptedRequests = () => (
    <View style={styles.tabContainer}>
        <Text>Accepted Requests</Text>
        {/* Add functionality to display accepted requests */}
    </View>
);

const PoojaRequestScreen: React.FC = () => {

    return (
        <View style={styles.container}>
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
                <Tab.Screen name="All" component={AllRequests} />
                <Tab.Screen name="Pending" component={PendingRequests} />
                <Tab.Screen name="Accepted" component={AcceptedRequests} />
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

export default PoojaRequestScreen;