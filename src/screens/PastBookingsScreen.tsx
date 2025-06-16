import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
// import {useAuth} from '../navigation/RootNavigator';
import CustomHeader from '../components/CustomHeader';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { COLORS } from '../theme/theme';
import AllPastBookinsScreen from './AllPastBookinsScreen';
import SearchBookings from '../components/SearchBookings';

const Tab = createMaterialTopTabNavigator();

const PastBookingsScreen: React.FC = () => {
  
    return (
        <View style={styles.container}>
            <CustomHeader showBackButton={false} showMenuButton={true} title={'Past Bookings'}/>
            <SearchBookings/>
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
                <Tab.Screen name="All" component={AllPastBookinsScreen} />
                <Tab.Screen name="Accepted" component={AllPastBookinsScreen} />
                <Tab.Screen name="Completed" component={AllPastBookinsScreen} />
                {/* <Tab.Screen name="Rejected" component={AllPastBookinsScreen} /> */}
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

export default PastBookingsScreen;
