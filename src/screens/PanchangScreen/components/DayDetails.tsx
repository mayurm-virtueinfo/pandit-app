import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../theme/theme';
import { CalendarDay } from '../../../api/apiService';
import { PanchangIcon, AstronomyIcon } from './PanchangIcons';
import CurrentChoghadiyaCard from './CurrentChoghadiyaCard';
import RealisticMoon from './RealisticMoon';

interface DayDetailsProps {
  selectedDate: CalendarDay | null;
  choghadiyaData: any[];
  cityName?: string | null;
}

const getChoghadiyaColor = (quality: string) => {
  switch (quality) {
    case 'Good':
      return COLORS.choghadiya.good;
    case 'Bad':
      return COLORS.choghadiya.bad;
    case 'Neutral':
    case 'Normal':
      return COLORS.choghadiya.normal;
    default:
      return { bg: '#F5F5F5', text: '#616161' };
  }
};

const DayDetails: React.FC<DayDetailsProps> = ({
  selectedDate,
  choghadiyaData,
  cityName,
}) => {
  if (!selectedDate) return null;

  // Safety check for panchang data which is not in grid data
  if (!selectedDate.panchang) {
    return null;
  }

  const dayChoghadiya = choghadiyaData.filter(item => item.period === 'Day');
  const nightChoghadiya = choghadiyaData.filter(
    item => item.period === 'Night',
  );

  const renderChoghadiyaLegend = () => {
    const items = [
      { label: 'Good', color: COLORS.choghadiya.good.text },
      { label: 'Bad', color: COLORS.choghadiya.bad.text },
      { label: 'Normal', color: COLORS.choghadiya.normal.text },
    ];

    return (
      <View style={styles.legendContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendIndicator, { backgroundColor: item.color }]}
            />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderChoghadiyaTable = (title: string, data: any[]) => {
    if (!data || data.length === 0) return null;

    return (
      <View
        style={[
          styles.panchangCard,
          { marginBottom: 16, backgroundColor: COLORS.white },
        ]}
      >
        <Text style={styles.chogadiaSectionTitle}>{title}</Text>
        {/* Table Header */}
        <View style={styles.chogadiaTableHeader}>
          <Text style={[styles.chogadiaHeaderText, { flex: 1.2 }]}>
            Choghadiya
          </Text>
          <Text style={[styles.chogadiaHeaderText, { flex: 1 }]}>
            Start Time
          </Text>
          <Text style={[styles.chogadiaHeaderText, { flex: 1 }]}>End Time</Text>
        </View>

        {/* Table Rows */}
        {data.map((item, index) => {
          const chogadiaName = item.type.replace(' Muhurat', '');
          const colors = getChoghadiyaColor(item.quality);

          return (
            <View
              key={index}
              style={[
                styles.chogadiaRow,
                {
                  backgroundColor: colors.bg,
                },
                index === data.length - 1 && {
                  borderBottomWidth: 0,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                },
              ]}
            >
              <Text
                style={[
                  styles.chogadiaName,
                  { flex: 1.2, color: colors.text, fontWeight: '700' },
                ]}
              >
                {chogadiaName}
              </Text>

              <Text
                style={[styles.chogadiaTime, { flex: 1, color: colors.text }]}
              >
                {item.start}
              </Text>
              <Text
                style={[styles.chogadiaTime, { flex: 1, color: colors.text }]}
              >
                {item.end}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.detailsContainer}>
      <View style={[styles.panchangCard, { backgroundColor: COLORS.white }]}>
        <View style={styles.cardHeader}>
          {/* Left Side: Date and Paksha */}
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.cardDate}>
              {new Date(selectedDate.date).toLocaleDateString('default', {
                day: 'numeric',
                month: 'long',
                weekday: 'long',
              })}
            </Text>
            <View style={styles.pakshaBadge}>
              <Text style={styles.pakshaText}>
                {selectedDate.panchang.paksha} Paksha
              </Text>
            </View>
          </View>

          {/* Right Side: Moon Image */}
          <View>
            <RealisticMoon
              phase={selectedDate.astronomy.moon_phase}
              size={56}
              displayText={selectedDate.gujarati.display_text}
            />
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <View style={styles.gridHeader}>
                <View style={styles.iconContainer}>
                  <PanchangIcon name="tithi" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.gridLabel}>Tithi</Text>
              </View>
              <Text style={styles.gridValue}>
                {selectedDate.panchang.tithi?.name}
              </Text>
              {selectedDate.panchang.tithi?.end_time && (
                <Text style={styles.gridTime}>
                  Ends: {selectedDate.panchang.tithi.end_time}
                </Text>
              )}
            </View>

            <View style={styles.gridItem}>
              <View style={styles.gridHeader}>
                <View style={styles.iconContainer}>
                  <PanchangIcon
                    name="nakshatra"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.gridLabel}>Nakshatra</Text>
              </View>
              <Text style={styles.gridValue}>
                {selectedDate.panchang.nakshatra?.name}
              </Text>
              {selectedDate.panchang.nakshatra?.end_time && (
                <Text style={styles.gridTime}>
                  Ends: {selectedDate.panchang.nakshatra.end_time}
                </Text>
              )}
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <View style={styles.gridHeader}>
                <View style={styles.iconContainer}>
                  <PanchangIcon name="yoga" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.gridLabel}>Yoga</Text>
              </View>
              <Text style={styles.gridValue}>
                {selectedDate.panchang.yoga?.name}
              </Text>
              {selectedDate.panchang.yoga?.end_time && (
                <Text style={styles.gridTime}>
                  Ends: {selectedDate.panchang.yoga.end_time}
                </Text>
              )}
            </View>

            <View style={styles.gridItem}>
              <View style={styles.gridHeader}>
                <View style={styles.iconContainer}>
                  <PanchangIcon
                    name="karana"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.gridLabel}>Karana</Text>
              </View>
              <Text style={styles.gridValue}>
                {selectedDate.panchang.karana?.name}
              </Text>
              {selectedDate.panchang.karana?.end_time && (
                <Text style={styles.gridTime}>
                  Ends: {selectedDate.panchang.karana.end_time}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 16 }} />

      {/* Astronomy Section */}
      <View style={[styles.panchangCard, { backgroundColor: COLORS.white }]}>
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardDate,
              { color: COLORS.primary, marginBottom: 0 },
            ]}
          >
            Sun & Moon
          </Text>
          {cityName && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primary + '15',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Ionicons
                name="location-sharp"
                size={14}
                color={COLORS.primary}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.primary,
                  fontWeight: '600',
                  marginLeft: 4,
                }}
              >
                {cityName}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[styles.cardDivider, { backgroundColor: COLORS.border }]}
        />

        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <View
              style={[
                styles.gridItem,
                {
                  borderColor: COLORS.border,
                  shadowColor: COLORS.primary,
                },
              ]}
            >
              <View style={styles.gridHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: COLORS.white },
                  ]}
                >
                  <AstronomyIcon
                    name="sunrise"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.gridLabel}>Sunrise</Text>
              </View>
              <Text style={styles.gridValue}>
                {selectedDate.astronomy.sunrise}
              </Text>
            </View>

            <View
              style={[
                styles.gridItem,
                {
                  borderColor: COLORS.border,
                  shadowColor: COLORS.primary,
                },
              ]}
            >
              <View style={styles.gridHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: COLORS.white },
                  ]}
                >
                  <AstronomyIcon
                    name="sunset"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.gridLabel}>Sunset</Text>
              </View>
              <Text style={styles.gridValue}>
                {selectedDate.astronomy.sunset}
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            <View
              style={[
                styles.gridItem,
                {
                  borderColor: COLORS.border,
                  shadowColor: COLORS.primary,
                },
              ]}
            >
              <View style={styles.gridHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: COLORS.white },
                  ]}
                >
                  <AstronomyIcon
                    name="moonrise"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.gridLabel}>Moonrise</Text>
              </View>
              <Text style={styles.gridValue}>
                {selectedDate.astronomy.moonrise || '--:--'}
              </Text>
            </View>

            <View
              style={[
                styles.gridItem,
                {
                  borderColor: COLORS.border,
                  shadowColor: COLORS.primary,
                },
              ]}
            >
              <View style={styles.gridHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: COLORS.white },
                  ]}
                >
                  <AstronomyIcon
                    name="moonset"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.gridLabel}>Moonset</Text>
              </View>
              <Text style={styles.gridValue}>
                {selectedDate.astronomy.moonset || '--:--'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 16 }} />

      {/* Current Choghadiya Section */}
      {/* Current Choghadiya Section - Only show for today */}
      {selectedDate.date === new Date().toISOString().split('T')[0] && (
        <CurrentChoghadiyaCard choghadiyaData={choghadiyaData} />
      )}

      <View style={{ height: 16 }} />

      {/* Legend */}
      {choghadiyaData.length > 0 && renderChoghadiyaLegend()}

      {/* Chogadia Tables */}
      {renderChoghadiyaTable('Day Choghadiya', dayChoghadiya)}
      {renderChoghadiyaTable('Night Choghadiya', nightChoghadiya)}
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    width: '100%',
    padding: 12,
    marginVertical: 20,
  },
  panchangCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardDate: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  pakshaBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignSelf: 'flex-start',
  },
  pakshaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 20,
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'flex-start', // Ensure left alignment
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  iconContainer: {
    marginRight: 8,
    backgroundColor: COLORS.white,
    padding: 6,
    borderRadius: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'left',
  },
  gridTime: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'left',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 12,
    height: 12,
    marginRight: 6,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chogadiaSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  chogadiaTableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
  },
  chogadiaHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'left',
  },
  chogadiaRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chogadiaName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chogadiaTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
});

export default React.memo(DayDetails);
