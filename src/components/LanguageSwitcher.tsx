import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18n, {changeLanguage} from '../i18n';
import {Picker} from '@react-native-picker/picker';

export default function LanguageSwitcher() {
  const {t} = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    setSelectedLang(lang);
    console.log('lang :: ', lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language')}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLang}
          style={styles.picker}
          onValueChange={itemValue => handleLanguageChange(itemValue)}
          mode="dropdown">
          <Picker.Item label="English" value="en" />
          <Picker.Item label="हिन्दी" value="hi" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    marginBottom: 12,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    width: 180,
    height: 44,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    color: '#333',
  },
});
