import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../theme/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { EarningsParamList } from '../navigation/EarningsNavigator';
import { useNavigation } from '@react-navigation/native';

const years = ['2021', '2022', '2023', '2024', '2025'];
const months = [
  '-', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthData = [
  { month: 'January', amount: '₹50,000', status: 'Pending' },
  { month: 'February', amount: '₹55,000', status: 'Paid' },
  { month: 'March', amount: '₹60,500', status: 'Paid' },
  { month: 'April', amount: '₹66,550', status: 'Paid' },
  { month: 'May', amount: '₹73,205', status: 'Paid' },
  { month: 'June', amount: '₹80,525', status: 'Paid' },
  { month: 'July', amount: '₹88,578', status: 'Paid' },
  { month: 'August', amount: '₹97,436', status: 'Paid' },
  { month: 'September', amount: '₹107,179', status: 'Paid' },
  { month: 'October', amount: '₹117,897', status: 'Paid' },
  { month: 'November', amount: '₹129,687', status: 'Paid' },
  { month: 'December', amount: '₹142,655', status: 'Paid' },
];

type ScreenNavigationProp = StackNavigationProp<
  EarningsParamList,
  'EarningDetailScreen'
>;
const EarningsScreen : React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedMonth, setSelectedMonth] = useState('-');

  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const handleApplyFilterPress = () => {
    navigation.navigate('EarningDetailScreen');
  }
  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={false}
        showMenuButton={true}
        title={'Earnings Overview'}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Lifetime Earnings */}
        <Text style={styles.sectionTitle}>Lifetime Earnings</Text>
        <View style={styles.earningsBox}>
          <Text style={styles.earningsAmount}>₹15,69,00.00</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Earnings Overview</Text>

        {/* Year Picker */}
        <Text style={styles.label}>Select Year</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setYearModalVisible(true)}>
          <Text style={styles.dropdownText}>{selectedYear}</Text>
        </TouchableOpacity>

        {/* Month Picker */}
        <Text style={styles.label}>Month</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setMonthModalVisible(true)}>
          <Text style={styles.dropdownText}>{selectedMonth}</Text>
        </TouchableOpacity>

        {/* Month Range */}
        <Text style={styles.label}>Month</Text>
        <View style={styles.monthRangeRow}>
          <TouchableOpacity style={styles.rangeBox}>
            <Text style={styles.dropdownText}>Select</Text>
          </TouchableOpacity>
          <Text style={styles.hyphen}>-</Text>
          <TouchableOpacity style={styles.rangeBox}>
            <Text style={styles.dropdownText}>Select</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleApplyFilterPress} style={styles.applyButton}>
            <Text style={styles.applyText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Total */}
        <Text style={styles.totalEarningsLabel}>Total Earnings for {selectedYear}</Text>
        <View style={styles.totalEarningsBox}>
          <Text style={styles.totalEarningsText}>₹6,55,000</Text>
        </View>

        {/* Month Data List */}
        <Text style={styles.sectionTitle}>Current Month</Text>
        <FlatList
          data={monthData}
          keyExtractor={item => item.month}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.monthRow}>
              <View style={styles.iconBox}>
                <Icon name="calendar" size={20} color={COLORS.darkText} />
              </View>
              <View>
                <Text style={styles.monthText}>{item.month}</Text>
                <Text style={styles.statusText}>
                  {item.amount} - {item.status}
                </Text>
              </View>
            </View>
          )}
        />
      </ScrollView>

      {/* Year Modal */}
      <Modal
        visible={yearModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setYearModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setYearModalVisible(false)}>
          <View style={styles.modalContent}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                onPress={() => {
                  setSelectedYear(year);
                  setYearModalVisible(false);
                }}
                style={styles.modalItem}>
                <Text style={styles.modalText}>{year}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Month Modal */}
      <Modal
        visible={monthModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMonthModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMonthModalVisible(false)}>
          <View style={styles.modalContent}>
            {months.map((month) => (
              <TouchableOpacity
                key={month}
                onPress={() => {
                  setSelectedMonth(month);
                  setMonthModalVisible(false);
                }}
                style={styles.modalItem}>
                <Text style={styles.modalText}>{month}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default EarningsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  earningsBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: 'green',
  },
  label: {
    fontSize: 14,
    marginTop: 16,
    color: COLORS.darkText,
    marginBottom: 4,
  },
  dropdown: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    padding: 12,
  },
  dropdownText: {
    color: COLORS.darkText,
    fontSize: 14,
  },
  monthRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rangeBox: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    padding: 12,
    borderRadius: 6,
  },
  hyphen: {
    marginHorizontal: 8,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginRight: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  cancelText: {
    color: COLORS.darkText,
    fontWeight: '600',
  },
  applyText: {
    color: '#fff',
    fontWeight: '600',
  },
  totalEarningsLabel: {
    marginTop: 16,
    color: COLORS.darkText,
    fontSize: 14,
  },
  totalEarningsBox: {
    backgroundColor: COLORS.inputBg,
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  totalEarningsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginRight: 12,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.textGray,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.inputBg,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.darkText,
  },
});
