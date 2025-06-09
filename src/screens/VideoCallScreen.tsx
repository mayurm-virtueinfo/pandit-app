import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import CustomHeader from '../components/CustomHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VideoCallScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
  const handleMute = () => {
    // Add mute logic
    console.log('Mute toggled');
  };

  const handleEndCall = () => {
    // Add end call logic
    console.log('Call ended');
  };

  return (
    <View style={[styles.container,{marginBottom:insets.bottom}]}>
      <CustomHeader showBackButton={true} showMenuButton={false} title={'Astrology Consultation'} />

      <View style={styles.videoContainer}>
        <Image
          source={{uri:'https://www.shutterstock.com/shutterstock/photos/1803127858/display_1500/stock-vector-vector-graphic-illustration-indian-pandit-is-talking-on-a-mobile-phone-individually-on-white-1803127858.jpg'}} // Replace with actual image
          style={styles.fullVideo}
          resizeMode="cover"
        />
        <Image
          source={{uri:'https://c8.alamy.com/comp/2BCTP34/laptop-screen-view-aged-woman-use-videocall-talking-with-relatives-2BCTP34.jpg'}} // Replace with actual image
          style={styles.miniVideo}
          resizeMode="cover"
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.muteButton} onPress={handleMute}>
          <Icon name="mic-off-outline" size={20} color="#000" />
          <Text style={styles.muteText}>Mute</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
          <Icon name="call-outline" size={20} color="#fff" />
          <Text style={styles.endText}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  fullVideo: {
    width: '100%',
    height: '100%',
  },
  miniVideo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
  },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  muteText: {
    marginLeft: 8,
    color: '#000',
    fontWeight: '500',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  endText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '500',
  },
});
