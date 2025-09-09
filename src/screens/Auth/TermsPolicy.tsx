import React from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {COLORS} from '../../theme/theme';

export default function TermsPolicyScreen() {
  // Get htmlContent and title from navigation params (passed from SignInScreen)
  const route = useRoute<any>();
  const {htmlContent, title} = route.params || {};
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Fallback if no content is provided
  const htmlToShow =
    htmlContent?.data ||
    '<div style="padding:16px;font-size:16px;color:#222;">No content available.</div>';

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CustomHeader
        title={title || 'Policy'}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <WebView
        originWhitelist={['*']}
        source={{html: htmlToShow}}
        style={styles.webview}
        startInLoadingState
        scalesPageToFit
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.primaryBackground},
  webview: {flex: 1, backgroundColor: '#fff'},
});
