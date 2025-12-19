import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { setAppLanguage, getCurrentLanguage } from '../i18n';
import { COLORS, THEMESHADOW } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../theme/fonts';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'हिन्दी', value: 'hi' },
  { label: 'ગુજરાતી', value: 'gu' },
  { label: 'मराठी', value: 'mr' },
];

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(getCurrentLanguage());
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageChange = async (lang: string) => {
    await setAppLanguage(lang);
    setSelectedLang(lang);
    setModalVisible(false);
  };

  const getSelectedLangLabel = () => {
    const found = LANGUAGES.find(l => l.value === selectedLang);
    return found ? found.label : 'English';
  };

  const renderLanguageItem = ({ item }: { item: { label: string; value: string } }) => {
    const isSelected = item.value === selectedLang;
    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.languageItemSelected]}
        onPress={() => handleLanguageChange(item.value)}
        activeOpacity={0.7}
      >
        <Text style={styles.languageLabel}>{item.label}</Text>
        <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
          {isSelected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container,THEMESHADOW.shadow]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{t('language')}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{getSelectedLangLabel()}</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primaryTextDark} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('select_language') || 'Select Language'}</Text>
            <FlatList
              data={LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={item => item.value}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.inputLabelText,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.textPrimary, // Or gray if preferred
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    paddingVertical: 20,
    paddingHorizontal: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
  },
  languageItemSelected: {
    backgroundColor: '#FFF5F5',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  languageLabel: {
    fontSize: 16,
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.black,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: 'red', // Or COLORS.primary if it's red
    borderColor: 'red',
  },
});
