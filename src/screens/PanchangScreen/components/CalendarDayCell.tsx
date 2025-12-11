import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import RealisticMoon from './RealisticMoon';
import { CalendarDay } from '../../../api/apiService';
import { COLORS } from '../../../theme/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_MARGIN = 4;
const CELL_WIDTH = (SCREEN_WIDTH - CELL_MARGIN * 14 - 16) / 7;

interface CalendarDayCellProps {
  item: CalendarDay | null;
  isSelected: boolean;
  isToday: boolean;
  onPress: (item: CalendarDay) => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  item,
  isSelected,
  isToday,
  onPress,
}) => {
  if (!item) {
    return (
      <View
        style={[
          styles.cell,
          { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
        ]}
      />
    );
  }

  const dayNum = new Date(item.date).getDate();
  // Tithi Text: "Sud 11"
  const tithiText = item.gujarati.display_text.split(' ').slice(1).join(' ');

  const cellContent = (
    <>
      <View style={styles.moonContainer}>
        <RealisticMoon
          phase={item.astronomy.moon_phase}
          size={24}
          date={item.date}
          displayText={item.gujarati.display_text}
        />
      </View>
      <Text
        style={[
          styles.dateText,
          isSelected && styles.selectedDateText,
          isToday && styles.todayDateText,
        ]}
      >
        {dayNum}
      </Text>
      <Text
        style={[
          styles.tithiText,
          isSelected && styles.selectedTithiText,
          isToday && styles.todayTithiText,
        ]}
        numberOfLines={1}
      >
        {tithiText}
      </Text>
    </>
  );

  // Dynamic Style for Cell
  let cellStyle: any[] = [styles.cell];
  if (isToday) {
    cellStyle.push(styles.todayCell);
  }
  if (isSelected && !isToday) {
    cellStyle.push(styles.selectedCell);
  }

  if (isToday) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(item)}>
        <View style={[cellStyle, { backgroundColor: COLORS.primary }]}>
          {cellContent}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(item)}>
      <View style={cellStyle}>{cellContent}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: CELL_WIDTH,
    height: CELL_WIDTH * 1.8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: CELL_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  todayCell: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  todayDateText: {
    color: COLORS.white,
  },
  moonContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 10,
  },
  tithiText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  todayTithiText: {
    color: COLORS.white,
    opacity: 0.9,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  selectedDateText: {
    color: COLORS.primary,
  },
  selectedTithiText: {
    color: COLORS.primary,
  },
});

export default React.memo(CalendarDayCell);
