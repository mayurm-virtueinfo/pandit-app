import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { apiService, ChatMessage } from '../api/apiService';
// import { COLORS } from '../theme/colors';
import CustomHeader from '../components/CustomHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AstroRequestParamList } from '../navigation/AstroRequestNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<
  AstroRequestParamList,
  'VideoCall'
>;

const ChatMessagesScreen: React.FC = () => {
    const navigation = useNavigation<ScreenNavigationProp>();
    const insets = useSafeAreaInsets();
  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);

  const fetchMessagesList = async () => {
    const requests = await apiService.getMessages();
    console.log('Fetched getMessages Requests:', requests);
    setMessagesList(requests);
  };

  useEffect(() => {
    fetchMessagesList();
  }, []);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender.isUser;
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
          
        ]}
      >
        {!isUser && (
          <Image
            source={{
            uri: 'https://johnjronline.wordpress.com/wp-content/uploads/2025/04/john-jr-avatar-transparent-avataaars.png', // Replace with actual avatar URL
          }} // Replace with actual path
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.receiverBubble,
          ]}
        >
          {!isUser && <Text style={styles.senderName}>{item.sender.name}</Text>}
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const handleVideoCallPress = () => {
    navigation.navigate('VideoCall');
  }
  return (
    <View style={[styles.container, { marginBottom: insets.bottom }]}>
      <CustomHeader showBackButton={true} showMenuButton={false} title={'Astrology Consultation'} />
      <FlatList
        data={messagesList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <Image
          source={{
            uri: 'https://johnjronline.wordpress.com/wp-content/uploads/2025/04/john-jr-avatar-transparent-avataaars.png', // Replace with actual avatar URL
          }} // Replace with actual path
          style={styles.inputAvatar}
        />
        <TextInput
          style={styles.input}
          placeholder="Type message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity>
          <Icon name="call-outline" size={22} color="black" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleVideoCallPress}>
          <Icon name="videocam-outline" size={24} color="black" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="attach-outline" size={24} color="black" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
    // flexDirection: 'row-reverse',
    // backgroundColor:'yellow'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 10,
  },
  receiverBubble: {
    backgroundColor: '#F1F1F1',
  },
  userBubble: {
    backgroundColor: COLORS.primary,
  },
  senderName: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  messageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  inputAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    marginRight: 8,
  },
  icon: {
    marginHorizontal: 4,
  },
});
