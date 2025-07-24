import React, {useMemo, useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Calendar as RNCalendar} from 'react-native-calendars';
import {COLORS, wp, hp, THEMESHADOW} from '../theme/theme';
import Fonts from '../theme/fonts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

interface CalendarProps {
  onDateSelect?: (dates: string[]) => void; // Updated to return array of dates
  month?: string; // e.g. "September 2025"
  onMonthChange?: (direction: 'prev' | 'next') => void;
  selected?: string[]; // Array of selected date strings (YYYY-MM-DD)
}

function getMonthYearFromString(monthStr: string) {
  const [monthName, yearStr] = monthStr.split(' ');
  const month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ].findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  const year = parseInt(yearStr, 10);
  return {month, year};
}

const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  month,
  onMonthChange,
  selected: initialSelected = [],
}) => {
  const [selectedDates, setSelectedDates] = useState<string[]>(initialSelected);

  useEffect(() => {
    setSelectedDates(initialSelected);
  }, [initialSelected]);

  const {month: monthIdx, year} = useMemo(() => {
    if (month) return getMonthYearFromString(month);
    const today = new Date();
    return {month: today.getMonth(), year: today.getFullYear()};
  }, [month]);

  const initialDate = useMemo(() => {
    return `${year}-${String(monthIdx + 1).padStart(2, '0')}-01`;
  }, [monthIdx, year]);

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(
    todayObj.getMonth() + 1,
  ).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  // Convert UTC dates to YYYY-MM-DD format
  const predefinedDates = [
    Date.UTC(2025, 8, 19),
    Date.UTC(2025, 8, 20),
    Date.UTC(2025, 8, 21),
    Date.UTC(2025, 8, 25),
    Date.UTC(2025, 8, 26),
    Date.UTC(2025, 8, 27),
  ].map(date => {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      '0',
    )}-${String(d.getUTCDate()).padStart(2, '0')}`;
  });

  const markedDates: {[date: string]: any} = {};

  // Mark predefined and selected dates
  const allSelectedDates = [...new Set([...selectedDates, ...predefinedDates])]; // Combine and remove duplicates
  allSelectedDates.forEach(dateStr => {
    // If today is selected, set background as red
    if (dateStr === todayStr) {
      markedDates[dateStr] = {
        customStyles: {
          container: {
            backgroundColor: COLORS.primaryBackground,
            borderRadius: 9999,
            width: wp(8),
            height: wp(8),
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          },
          text: {
            color: COLORS.white,
            fontFamily: Fonts.Sen_Medium,
            fontSize: moderateScale(12),
          },
        },
        selected: true,
      };
    } else if (!markedDates[dateStr]) {
      markedDates[dateStr] = {
        customStyles: {
          container: {
            backgroundColor: COLORS.primaryBackground,
            borderRadius: 9999,
            width: wp(8),
            height: wp(8),
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          },
          text: {
            color: COLORS.white,
            fontFamily: Fonts.Sen_Medium,
            fontSize: moderateScale(12),
          },
        },
        selected: true,
      };
    }
  });

  // Mark today with yellow background only if not selected
  if (
    todayObj.getFullYear() === year &&
    todayObj.getMonth() === monthIdx &&
    !selectedDates.includes(todayStr)
  ) {
    markedDates[todayStr] = {
      customStyles: {
        container: {
          backgroundColor: COLORS.primaryBackgroundButton, // yellow
          borderRadius: 9999,
          width: wp(8),
          height: wp(8),
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        },
        text: {
          color: COLORS.primaryTextDark,
          fontFamily: Fonts.Sen_Medium,
          fontSize: moderateScale(12),
        },
      },
    };
  }

  const handleMonthChange = (dateObj: any) => {
    if (!onMonthChange) return;
    const currentMonth = monthIdx + 1;
    if (dateObj.month < currentMonth || dateObj.year < year) {
      onMonthChange('prev');
    } else if (dateObj.month > currentMonth || dateObj.year > year) {
      onMonthChange('next');
    }
  };

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    setSelectedDates(prev => {
      let newSelectedDates: string[];
      if (prev.includes(dateStr)) {
        newSelectedDates = prev.filter(d => d !== dateStr);
      } else {
        newSelectedDates = [...prev, dateStr];
      }
      onDateSelect?.(newSelectedDates);
      return newSelectedDates;
    });
  };

  return (
    <View style={[styles.calendarContainer, THEMESHADOW.shadow]}>
      <RNCalendar
        current={initialDate}
        markingType={'custom'}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        theme={{
          backgroundColor: COLORS.white,
          calendarBackground: COLORS.white,
          textSectionTitleColor: COLORS.pujaCardSubtext,
          textSectionTitleDisabledColor: '#d9e1e8',
          dayTextColor: COLORS.primaryTextDark,
          textDisabledColor: COLORS.pujaCardSubtext,
          monthTextColor: COLORS.primaryTextDark,
          textMonthFontFamily: Fonts.Sen_Medium,
          textDayFontFamily: Fonts.Sen_Medium,
          textDayHeaderFontFamily: Fonts.Sen_Medium,
          textMonthFontSize: moderateScale(15),
          textDayFontSize: moderateScale(12),
          textDayHeaderFontSize: moderateScale(12),
          arrowColor: COLORS.primaryTextDark,
          'stylesheet.day.basic': {
            base: {
              width: wp(12),
              height: hp(4),
              alignItems: 'center',
              justifyContent: 'center',
            },
            text: {
              fontSize: moderateScale(12),
              fontFamily: Fonts.Sen_Medium,
              color: COLORS.primaryTextDark,
              textAlign: 'center',
            },
          },
        }}
        hideExtraDays={false}
        renderArrow={(direction: 'left' | 'right') => (
          <Text style={styles.arrowIcon}>
            {direction === 'left' ? '‹' : '›'}
          </Text>
        )}
        firstDay={0}
        enableSwipeMonths={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: COLORS.white,
    padding: moderateScale(10),
  },
  currentDataContainer: {
    marginBottom: verticalScale(8),
    alignItems: 'center',
  },
  currentDataText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
  },
  arrowIcon: {
    fontSize: moderateScale(18),
    color: COLORS.primaryTextDark,
    fontWeight: 'bold',
  },
});

export default Calendar;
