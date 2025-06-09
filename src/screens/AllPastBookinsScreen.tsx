import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { apiService, PastBookingItem, PoojaRequestItem } from '../api/apiService'; // adjust path
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PoojaRequestParamList } from '../navigation/PoojaRequestNavigator';
import { COLORS } from '../theme/theme';

type ScreenNavigationProp = StackNavigationProp<
  PoojaRequestParamList,
  'PoojaRequestDetail'
>;

const AllPastBookinsScreen: React.FC = () => {
    const navigation = useNavigation<ScreenNavigationProp>();
    const [pastBookings, setPastBookings] = useState<PastBookingItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAllPastRequests();
    }, []);

    const fetchAllPastRequests = async () => {
        const requests = await apiService.getPastBookings();
        console.log('Fetched Pooja Requests:', requests);
        setPastBookings(requests);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAllPastRequests();
        setRefreshing(false);
    };

    const handleRequestPress = (item: PoojaRequestItem) => {
        // Handle the request press, e.g., navigate to a details screen or show more info
        console.log('Request pressed:', item);
        navigation.navigate('PoojaRequestDetail', { request: item });
    };

    const getStatusText = (status: string) => {
  switch (status) {
    case 'cancelled':
      return 'Cancelled by User';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return COLORS.success; // green
    case 'cancelled':
      return COLORS.warning; // orange/red
    case 'rejected':
      return COLORS.error; // red
    case 'accepted':
      return COLORS.primary; // blue or main brand color
    default:
      return COLORS.gray;
  }
};
    const renderItem = ({ item }: { item: PastBookingItem }) => (
        <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.poojaName} numberOfLines={1}>
            {item.poojaName}
          </Text>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.text}>Date {item.date}</Text>
        <Text style={styles.text}>{item.maharajName}</Text>
      </View>
    </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={pastBookings}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.maharajName}-${index}`}
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
    card: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poojaName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  text: {
    color: COLORS.textGray,
    fontSize: 13,
    marginTop: 2,
  },
});
export default AllPastBookinsScreen;