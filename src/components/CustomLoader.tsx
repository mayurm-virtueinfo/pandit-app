import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {COLORS} from '../theme/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type CustomeLoaderProps = {
  loading: boolean;
  backgroundColor?: string;
};

const CustomeLoader: React.FC<CustomeLoaderProps> = ({
  loading,
  backgroundColor = '#00000010',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      {loading && (
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: 9999,
            top: insets.top,
          }}>
          <View style={[styles.modalBackground, {backgroundColor}]}>
            <View style={styles.activityIndicatorWrapper}>
              <ActivityIndicator
                animating={loading}
                size="large"
                color={COLORS.primary}
              />
            </View>
          </View>
        </View>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  activityIndicatorWrapper: {
    backgroundColor: COLORS.white,
    height: 110,
    width: 115,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
export default CustomeLoader;
