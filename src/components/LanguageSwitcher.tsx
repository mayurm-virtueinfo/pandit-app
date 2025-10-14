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
import i18n, {setAppLanguage, getCurrentLanguage} from '../i18n';
import {Picker} from '@react-native-picker/picker';

const LANGUAGES = [
  {label: 'English', value: 'en'},
  {label: 'हिन्दी', value: 'hi'},
  {label: 'ગુજરાતી', value: 'gu'},
  {label: 'मराठी', value: 'mr'},
];

export default function LanguageSwitcher() {
  const {t} = useTranslation();
  const [selectedLang, setSelectedLang] = useState(getCurrentLanguage());
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageChange = async (lang: string) => {
    await setAppLanguage(lang);
    setSelectedLang(lang);
    setModalVisible(false);
  };

  // Helper to get the label for the selected language
  const getSelectedLangLabel = () => {
    const found = LANGUAGES.find(l => l.value === selectedLang);
    return found ? found.label : 'English';
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('language')}</Text>
        <TouchableOpacity
          style={styles.iosPickerButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.iosPickerButtonText}>
            {getSelectedLangLabel()}
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
                {LANGUAGES.map(lang => (
                  <Picker.Item
                    key={lang.value}
                    label={lang.label}
                    value={lang.value}
                    color="black"
                  />
                ))}
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
          {LANGUAGES.map(lang => (
            <Picker.Item
              key={lang.value}
              label={lang.label}
              value={lang.value}
            />
          ))}
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
