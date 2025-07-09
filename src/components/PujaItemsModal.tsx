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

interface PujaItemsModalProps extends Partial<ModalProps> {
  visible: boolean;
  onClose: () => void;
}

interface PujaItemsApiItem {
  id: number;
  item: string;
}

interface PujaItemsApiResponse {
  userItems: {
    description?: string;
    items: PujaItemsApiItem[];
  };
  panditjiItems: {
    description?: string;
    items: PujaItemsApiItem[];
  };
}

const PujaItemsModal: React.FC<PujaItemsModalProps> = ({
  visible,
  onClose,
  ...modalProps
}) => {
  const [userItems, setUserItems] = useState<PujaItemsApiItem[]>([]);
  const [panditjiItems, setPanditjiItems] = useState<PujaItemsApiItem[]>([]);
  const [userItemsDescription, setUserItemsDescription] = useState<string>('');
  const [panditjiItemsDescription, setPanditjiItemsDescription] =
    useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const {t, i18n} = useTranslation();

  // Helper to fetch and set data
  const fetchPujaItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiResult = await apiService.getPujaItemsData();
      let data: PujaItemsApiResponse;
      if (Array.isArray(apiResult)) {
        data = {
          userItems: {description: '', items: apiResult},
          panditjiItems: {description: '', items: []},
        };
      } else {
        data = {
          userItems: {
            description: (apiResult as any)?.userItems?.description || '',
            items: Array.isArray((apiResult as any)?.userItems?.items)
              ? (apiResult as any).userItems.items
              : [],
          },
          panditjiItems: {
            description: (apiResult as any)?.panditjiItems?.description || '',
            items: Array.isArray((apiResult as any)?.panditjiItems?.items)
              ? (apiResult as any).panditjiItems.items
              : [],
          },
        };
      }
      setUserItems(data.userItems.items);
      setUserItemsDescription(data.userItems.description || '');
      setPanditjiItems(data.panditjiItems.items);
      setPanditjiItemsDescription(data.panditjiItems.description || '');
      if (
        (!data.userItems.items || data.userItems.items.length === 0) &&
        (!data.panditjiItems.items || data.panditjiItems.items.length === 0)
      ) {
        setError('No puja items found.');
      }
    } catch (err) {
      setUserItems([]);
      setUserItemsDescription('');
      setPanditjiItems([]);
      setPanditjiItemsDescription('');
      setError('Failed to fetch puja items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch puja items from API
  useEffect(() => {
    if (visible) {
      fetchPujaItems();
    } else {
      // Reset data when modal is closed
      setUserItems([]);
      setUserItemsDescription('');
      setPanditjiItems([]);
      setPanditjiItemsDescription('');
      setError(null);
      setLoading(false);
    }
  }, [visible, fetchPujaItems]);

  const CloseIcon = () => (
    <View style={styles.closeIconContainer}>
      <View style={styles.closeXContainer}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={20} color="#191313" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ItemsList = ({items}: {items: PujaItemsApiItem[]}) => (
    <View style={styles.itemsList}>
      {items.map((item, index) => (
        <Text key={item.id ?? index} style={styles.itemText}>
          {index + 1}. {item.item}
        </Text>
      ))}
    </View>
  );

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
            ) : (
              <>
                {/* Items will be brought by the Panditji */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {t('items_to_be_arranged_by_you')}
                  </Text>
                  <Text style={styles.sectionDescription}>
                    {panditjiItemsDescription}
                  </Text>
                  <View style={styles.itemsContainer}>
                    {panditjiItems.length > 0 ? (
                      <ItemsList items={panditjiItems} />
                    ) : (
                      <Text style={styles.itemText}>{t('no_items_found')}</Text>
                    )}
                  </View>
                </View>

                {/* Items to be Arranged by You */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {t('items_will_be_brought_by_the_client')}
                  </Text>
                  <Text style={styles.sectionDescription}>
                    {userItemsDescription}
                  </Text>
                  <View style={styles.itemsContainer}>
                    {userItems.length > 0 ? (
                      <ItemsList items={userItems} />
                    ) : (
                      <Text style={styles.itemText}>{t('no_items_found')}</Text>
                    )}
                  </View>
                </View>
              </>
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
    height: '100%',
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
