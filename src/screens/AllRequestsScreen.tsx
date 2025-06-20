import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { apiService, PoojaRequestItem } from '../api/apiService'; // adjust path
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PoojaRequestParamList } from '../navigation/PoojaRequestNavigator';
import Fonts from '../theme/fonts';

type ScreenNavigationProp = StackNavigationProp<
  PoojaRequestParamList,
  'PoojaRequestDetail'
>;

const AllRequestsScreen: React.FC = () => {
    const navigation = useNavigation<ScreenNavigationProp>();
    const [poojaRequests, setPoojaRequests] = useState<PoojaRequestItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPoojaRequests();
    }, []);

    const fetchPoojaRequests = async () => {
        const requests = await apiService.getPoojaRequests();
        console.log('Fetched Pooja Requests:', requests);
        setPoojaRequests(requests);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPoojaRequests();
        setRefreshing(false);
    };

    const handleRequestPress = (item: PoojaRequestItem) => {
        // Handle the request press, e.g., navigate to a details screen or show more info
        console.log('Request pressed:', item);
        navigation.navigate('PoojaRequestDetail', { request: item });
    };
    const renderItem = ({ item }: { item: PoojaRequestItem }) => (
        <TouchableOpacity onPress={() => handleRequestPress(item)} style={styles.card}>
            <View style={styles.cardText}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>Scheduled on {item.scheduledDate}</Text>
            </View>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={poojaRequests}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 16,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    cardText: {
        flex: 1,
        paddingRight: 10,
    },
    title: {
        fontSize: 16,
        // fontWeight: 'bold',
        fontFamily:Fonts.Sen_Bold
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
        fontFamily: Fonts.Sen_Regular,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
});
export default AllRequestsScreen;