import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ModalProps,
  ActivityIndicator,
} from 'react-native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../theme/theme';
import Fonts from '../theme/fonts';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../api/apiService';
import {useTranslation} from 'react-i18next';

interface PujaItem {
  name: string;
  quantity: number;
  units: string;
}

interface PujaItemsSection {
  title: string;
  data: PujaItem[];
}

interface PujaItemsModalProps extends Partial<ModalProps> {
  visible: boolean;
  onClose: () => void;
  items?: PujaItemsSection[]; // Now optional and typed as array
}

const PujaItemsModal: React.FC<PujaItemsModalProps> = ({
  visible,
  onClose,
  items,
  ...modalProps
}) => {
  const {t} = useTranslation();

  // State for API fallback
  const [apiItems, setApiItems] = useState<PujaItemsSection[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to fetch and set data from API if needed
  const fetchPujaItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiResult = await apiService.getPujaItemsData();
      // Transform API result to PujaItemsSection[] format
      let sections: PujaItemsSection[] = [];
      if (Array.isArray(apiResult)) {
        // Fallback: treat as user items only
        sections = [
          {
            title: 'User Items',
            data: apiResult.map((item: any) => ({
              name: item.item || item.name || '',
              quantity: item.quantity || 1,
              units: item.units || '',
            })),
          },
        ];
      } else {
        // Try to extract user and panditji items
        const userItemsArr =
          Array.isArray(apiResult?.userItems?.items) &&
          apiResult.userItems.items.length > 0
            ? apiResult.userItems.items.map((item: any) => ({
                name: item.item || item.name || '',
                quantity: item.quantity || 1,
                units: item.units || '',
              }))
            : [];
        const panditjiItemsArr =
          Array.isArray(apiResult?.panditjiItems?.items) &&
          apiResult.panditjiItems.items.length > 0
            ? apiResult.panditjiItems.items.map((item: any) => ({
                name: item.item || item.name || '',
                quantity: item.quantity || 1,
                units: item.units || '',
              }))
            : [];
        if (userItemsArr.length > 0) {
          sections.push({title: 'User Items', data: userItemsArr});
        }
        if (panditjiItemsArr.length > 0) {
          sections.push({title: 'Pandit Items', data: panditjiItemsArr});
        }
      }
      setApiItems(sections);
      if (sections.length === 0) {
        setError('No pooja items found.');
      }
    } catch (err) {
      setApiItems(null);
      setError('Failed to fetch pooja items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Decide if we have items or need to fetch from API
  useEffect(() => {
    if (visible) {
      if (!items || !Array.isArray(items) || items.length === 0) {
        fetchPujaItems();
      } else {
        setApiItems(null);
        setError(null);
        setLoading(false);
      }
    } else {
      setApiItems(null);
      setError(null);
      setLoading(false);
    }
  }, [visible, items, fetchPujaItems]);

  const CloseIcon = () => (
    <View style={styles.closeIconContainer}>
      <View style={styles.closeXContainer}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={20} color="#191313" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ItemsList = ({data}: {data: PujaItem[]}) => (
    <View style={styles.itemsList}>
      {data.map((item, index) => (
        <Text key={index} style={styles.itemText}>
          {index + 1}. {item.name}
          {item.quantity ? ` - ${item.quantity}` : ''} {item.units}
        </Text>
      ))}
    </View>
  );

  // Which items to show: items prop if present, else apiItems
  const sectionsToShow: PujaItemsSection[] | null =
    items && Array.isArray(items) && items.length > 0 ? items : apiItems;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      {...modalProps}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('list_of_puja_items')}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            {loading ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 40,
                }}>
                <ActivityIndicator
                  size="large"
                  color={COLORS.primaryTextDark}
                />
              </View>
            ) : error ? (
              <View style={{alignItems: 'center', marginTop: 40}}>
                <Text
                  style={{
                    color: COLORS.primary || 'red',
                    fontFamily: Fonts.Sen_Medium,
                    fontSize: moderateScale(15),
                  }}>
                  {error}
                </Text>
              </View>
            ) : sectionsToShow && sectionsToShow.length > 0 ? (
              <>
                {sectionsToShow.map((section, idx) => (
                  <View style={styles.section} key={section.title + idx}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.itemsContainer}>
                      {section.data && section.data.length > 0 ? (
                        <ItemsList data={section.data} />
                      ) : (
                        <Text style={styles.itemText}>
                          {t('no_items_found')}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <View style={{alignItems: 'center', marginTop: 40}}>
                <Text
                  style={{
                    color: COLORS.primary || 'red',
                    fontFamily: Fonts.Sen_Medium,
                    fontSize: moderateScale(15),
                  }}>
                  {t('no_items_found')}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    height: '90%',
    backgroundColor: COLORS.pujaBackground,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
    marginBottom: verticalScale(24),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.primaryTextDark,
    textAlign: 'left',
  },
  closeButton: {
    width: scale(30),
    height: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconContainer: {
    width: scale(30),
    height: scale(30),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeXContainer: {
    position: 'absolute',
    left: scale(5),
    top: scale(5),
    width: scale(20),
    height: scale(20),
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(8),
  },
  sectionDescription: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.inputLabelText,
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(20),
  },
  itemsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(14),
    // Shadow for iOS
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    // Shadow for Android
    elevation: 4,
  },
  itemsList: {},
  itemText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    lineHeight: moderateScale(24),
  },
});

export default PujaItemsModal;
