import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ModalProps,
} from 'react-native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../theme/theme';
import Fonts from '../theme/fonts';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';

// Accept both string[] and PujaItem[] for flexibility
type PujaItem = {name: string; quantity?: number; units?: string} | string;

interface PujaItemsModalProps extends Partial<ModalProps> {
  visible: boolean;
  onClose: () => void;
  userItems?: PujaItem[];
  panditItems?: PujaItem[];
}

// Helper to normalize array of PujaItem|string to array of {name, quantity, units}
function normalizeItems(
  items?: PujaItem[],
): {name: string; quantity?: number; units?: string}[] {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    if (typeof item === 'string') {
      return {name: item};
    }
    return item;
  });
}

const PujaItemsModal: React.FC<PujaItemsModalProps> = ({
  visible,
  onClose,
  userItems,
  panditItems,
  ...modalProps
}) => {
  const normalizedUserItems = normalizeItems(userItems);
  const normalizedPanditItems = normalizeItems(panditItems);
  const {t} = useTranslation();

  const CloseIcon = () => (
    <View style={styles.closeIconContainer}>
      <View style={styles.closeXContainer}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={20} color="#191313" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ItemsList = ({
    data,
  }: {
    data: {name: string; quantity?: number; units?: string}[];
  }) => (
    <View style={styles.itemsList}>
      {data.map((item, index) => (
        <Text key={index} style={styles.itemText}>
          {index + 1}. {item.name}
          {item.quantity ? ` - ${item.quantity}` : ''}
          {item.units ? ` ${item.units}` : ''}
        </Text>
      ))}
    </View>
  );

  const hasAnyItems =
    (normalizedUserItems && normalizedUserItems.length > 0) ||
    (normalizedPanditItems && normalizedPanditItems.length > 0);

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
            {hasAnyItems ? (
              <>
                {normalizedUserItems && normalizedUserItems.length > 0 && (
                  <View style={styles.section} key="user-items">
                    <Text style={styles.sectionTitle}>{t('User Items')}</Text>
                    <View style={styles.itemsContainer}>
                      <ItemsList data={normalizedUserItems} />
                    </View>
                  </View>
                )}
                {normalizedPanditItems && normalizedPanditItems.length > 0 && (
                  <View style={styles.section} key="pandit-items">
                    <Text style={styles.sectionTitle}>{t('Pandit Items')}</Text>
                    <View style={styles.itemsContainer}>
                      <ItemsList data={normalizedPanditItems} />
                    </View>
                  </View>
                )}
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
