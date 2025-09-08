import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18n, {changeLanguage} from '../i18n';
import {Picker} from '@react-native-picker/picker';

export default function LanguageSwitcher() {
  const {t} = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    setSelectedLang(lang);
    setModalVisible(false);
    console.log('lang :: ', lang);
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('language')}</Text>
        <TouchableOpacity
          style={styles.iosPickerButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.iosPickerButtonText}>
            {selectedLang === 'en' ? 'English' : 'हिन्दी'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}>
            <View style={styles.iosModalContent}>
              <Picker
                selectedValue={selectedLang}
                onValueChange={itemValue => handleLanguageChange(itemValue)}
                style={styles.iosPicker}>
                <Picker.Item label="English" value="en" />
                <Picker.Item label="हिन्दी" value="hi" />
              </Picker>
              <TouchableOpacity
                style={styles.iosDoneButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.iosDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Android
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
  iosPickerButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    width: 180,
    height: 44,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosPickerButtonText: {
    color: '#333',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  iosModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    paddingTop: 12,
    alignItems: 'center',
  },
  iosPicker: {
    width: 250,
    height: 180,
  },
  iosDoneButton: {
    marginTop: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  iosDoneButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
