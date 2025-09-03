import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18n, {changeLanguage} from '../i18n';

export default function LanguageSwitcher() {
  const {t} = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const handleLanguageChange = (lang: any) => {
    changeLanguage(lang);
    setSelectedLang(lang);
    console.log('lang :: ', lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language')}</Text>
      <View style={styles.langButtons}>
        <TouchableOpacity
          style={[styles.button, selectedLang === 'en' && styles.selected]}
          onPress={() => handleLanguageChange('en')}>
          <Text
            style={[
              styles.buttonText,
              selectedLang === 'en' && styles.selectedText,
            ]}>
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedLang === 'hi' && styles.selected]}
          onPress={() => handleLanguageChange('hi')}>
          <Text
            style={[
              styles.buttonText,
              selectedLang === 'hi' && styles.selectedText,
            ]}>
            हिन्दी
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    marginBottom: 12,
    color: '#333',
  },
  langButtons: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    marginHorizontal: 10,
    backgroundColor: '#fff', // Default background for unselected buttons
  },
  selected: {
    backgroundColor: '#333', // Background for selected button
  },
  buttonText: {
    color: '#333', // Default text color for unselected buttons
    fontSize: 16,
  },
  selectedText: {
    color: '#fff', // Text color for selected buttons
  },
});
