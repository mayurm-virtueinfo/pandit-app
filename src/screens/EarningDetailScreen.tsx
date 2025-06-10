import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS } from '../theme/theme';
import CustomHeader from '../components/CustomHeader';

const { width } = Dimensions.get('window');

const EarningDetailScreen : React.FC = () => {
  const earnings = [
    { label: 'Ganesh Pooja', amount: 5000 },
    { label: 'Lakshmi Pooja', amount: 7000 },
    { label: 'Satyanarayan Pooja', amount: 4000 },
    { label: 'Navagraha Pooja', amount: 8000 },
    { label: 'Rudrabhishek', amount: 9000 },
    { label: 'Additional Dakshina', amount: 2000 },
  ];

  const total = earnings.reduce((sum, item) => sum + item.amount, 0);
  const deductions = total * 0.18;
  const netEarnings = total - deductions;

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        data: [20000, 25000, 28000, 35000],
        color: () => COLORS.primary,
      },
      {
        data: [3000, 3500, 4000, 6250],
        color: () => '#94f0ff',
      },
    ],
    legend: ['Earned', 'Deductions'],
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={true}
        showMenuButton={false}
        title={'Earnings'}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Nav Controls */}
        <View style={styles.navRow}>
          <Text style={styles.navButton}>{'◀︎ Previous'}</Text>
          <Text style={styles.currentMonth}>Current Month</Text>
          <Text style={styles.navButton}>{'Next ▶︎'}</Text>
        </View>

        {/* Earnings Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current month earnings</Text>
          {earnings.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.amount}>₹{item.amount}</Text>
            </View>
          ))}
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.amount}>₹{total.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Deductions (18%)</Text>
            <Text style={[styles.amount, { color: 'red' }]}>
              -₹{deductions.toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, styles.bold]}>Total Earnings</Text>
            <Text style={[styles.amount, styles.bold]}>
              ₹{netEarnings.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Earnings Breakdown */}
        <Text style={styles.sectionTitle}>Earnings Breakdown (Monthly)</Text>
        <View style={styles.card}>
          <Text style={styles.monthlyTotal}>₹35,000</Text>
          <Text style={styles.percentageChange}>This month <Text style={{ color: 'green' }}>+10%</Text></Text>
          <BarChart
            data={barChartData}
            width={width - 40}
            height={220}
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: () => COLORS.textGray,
              barPercentage: 0.5,
              useShadowColorFromDataset: false,
            }}
            withInnerLines={false}
            flatColor={true}
            showBarTops={false}
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EarningDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  currentMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: COLORS.darkText,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: COLORS.darkText,
  },
  amount: {
    fontSize: 14,
    color: COLORS.darkText,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBg,
    marginVertical: 12,
  },
  bold: {
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  monthlyTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  percentageChange: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 8,
  },
});

