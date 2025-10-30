import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  useColorScheme,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18n, {setAppLanguage, getCurrentLanguage} from '../i18n';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../theme/theme';

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
  const colorScheme = useColorScheme();

  // Always use light mode for picker border/text but handle Done button for dark mode
  const textColor = COLORS.lighttext;
  const pickerIconColor = COLORS.lighttext;

  // For Done button: use light background in light mode, dark in dark mode; text should contrast
  const doneButtonBg =
    colorScheme === 'dark' ? '#222' : COLORS.lighttext;
  const doneButtonText =
    colorScheme === 'dark' ? COLORS.white : COLORS.white;

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
        <Text style={[styles.title, {color: textColor}]}>{t('language')}</Text>
        <TouchableOpacity
          style={styles.iosPickerButton}
          onPress={() => setModalVisible(true)}>
          <Text style={[styles.iosPickerButtonText, {color: textColor}]}>
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
                style={styles.iosPicker}
                itemStyle={{color: textColor}}
                dropdownIconColor={pickerIconColor}
              >
                {LANGUAGES.map(lang => (
                  <Picker.Item
                    key={lang.value}
                    label={lang.label}
                    value={lang.value}
                    color={textColor}
                  />
                ))}
              </Picker>
              <TouchableOpacity
                style={[
                  styles.iosDoneButton,
                  {backgroundColor: doneButtonBg},
                ]}
                onPress={() => setModalVisible(false)}>
                <Text style={[
                  styles.iosDoneButtonText,
                  {color: doneButtonText}
                ]}>
                  Done
                </Text>
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
      <Text style={[styles.title, {color: textColor}]}>{t('language')}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLang}
          style={[styles.picker, {color: textColor}]}
          onValueChange={itemValue => handleLanguageChange(itemValue)}
          mode="dropdown"
          dropdownIconColor={pickerIconColor}
        >
          {LANGUAGES.map(lang => (
            <Picker.Item
              key={lang.value}
              label={lang.label}
              value={lang.value}
              color={textColor}
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
    // color set dynamically
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lighttext,
    borderRadius: 8,
    overflow: 'hidden',
    width: 180,
    height: 44,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    // color set dynamically
  },
  iosPickerButton: {
    borderWidth: 1,
    borderColor: COLORS.lighttext,
    borderRadius: 8,
    width: 180,
    height: 44,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosPickerButtonText: {
    // color set dynamically
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  iosModalContent: {
    backgroundColor: COLORS.white,
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
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  iosDoneButtonText: {
    fontSize: 16,
  },
});
