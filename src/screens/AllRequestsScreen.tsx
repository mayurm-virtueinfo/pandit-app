import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image
} from 'react-native';

import { apiService, PoojaRequestItem } from '../api/apiService'; // adjust path

const AllRequestsScreen: React.FC = () => {
    const [poojaRequests, setPoojaRequests] = useState<PoojaRequestItem[]>([]);

    useEffect(() => {
        const fetchPoojaRequests = async () => {
            const requests = await apiService.getPoojaRequests();
            setPoojaRequests(requests);
        };

        fetchPoojaRequests();
    }, []);

    const renderItem = ({ item }: { item: PoojaRequestItem }) => (
        <View style={styles.card}>
            <View style={styles.cardText}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>Scheduled on {item.scheduledDate}</Text>
            </View>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* List */}
            <FlatList
                data={poojaRequests}
                renderItem={renderItem}
                keyExtractor={(item) => item.title}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
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
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
});

export default AllRequestsScreen;
