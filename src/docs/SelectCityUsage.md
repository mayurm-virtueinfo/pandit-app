# Select City Screen Usage

## Overview

The SelectCityScreen is a custom React Native TypeScript component that provides a city selection interface matching the provided design. It uses reusable custom components and follows the project's existing patterns.

## Components Created

### 1. SelectCityScreen (`src/screens/SelectCityScreen.tsx`)

Main screen component that provides:

- Custom header with gradient background and status bar
- City selection interface with search functionality
- Next button for navigation

### 2. CitySelector (`src/components/CitySelector.tsx`)

Reusable component for city selection that includes:

- Search functionality
- City list with checkboxes
- Customizable styling

### 3. CustomStatusBar (`src/components/CustomStatusBar.tsx`)

Reusable status bar component that matches the design:

- Time display
- Signal bars
- WiFi and battery indicators

### 4. City Types (`src/types/cityTypes.ts`)

TypeScript interfaces for type safety:

- CityOption interface
- CitySelectionState interface
- CitySelectEvent interface

## Navigation Integration

The screen is integrated into the AuthNavigator at `src/navigation/AuthNavigator.tsx`:

```typescript
// To navigate to the screen
navigation.navigate('SelectCity');
```

## Usage Examples

### Basic Usage

```typescript
import SelectCityScreen from '../screens/SelectCityScreen';

// The screen is ready to use in navigation
```

### Using CitySelector Component Separately

```typescript
import CitySelector from '../components/CitySelector';
import {CityOption} from '../types/cityTypes';

const cities: CityOption[] = [
  {id: '1', name: 'Mumbai', selected: true},
  {id: '2', name: 'Delhi', selected: false},
];

<CitySelector
  cities={cities}
  onCitySelect={cityId => handleCitySelect(cityId)}
  searchPlaceholder="Search City"
/>;
```

### Customization

The components are designed to be customizable:

- Colors can be modified in `src/theme/theme.ts`
- Fonts can be updated in `src/theme/fonts.ts`
- Styles can be overridden using the `containerStyle` prop

## Features

- ✅ Matches the provided design exactly
- ✅ Uses existing custom components (CustomHeader, PrimaryButton)
- ✅ TypeScript support with proper interfaces
- ✅ Reusable components for future use
- ✅ Follows project's existing patterns and styling
- ✅ Search functionality for cities
- ✅ Proper navigation integration
- ✅ **Mobile-responsive design** with scaleable dimensions
- ✅ **Keyboard-friendly** with proper KeyboardAvoidingView
- ✅ **Touch-optimized** with minimum 44pt touch targets
- ✅ **Performance-optimized** FlatList with item recycling
- ✅ **Screen size adaptable** using react-native-size-matters
- ✅ Accessibility considerations

## Mobile-Friendly Features

### Responsive Design

- Uses `moderateScale()` from react-native-size-matters for consistent sizing across devices
- Uses `wp()` and `hp()` helper functions for percentage-based dimensions
- Dynamic max heights based on screen dimensions (e.g., `SCREEN_HEIGHT * 0.4`)

### Touch Optimization

- Minimum 44pt touch targets for all interactive elements
- Increased padding on buttons and checkboxes for better usability
- Proper spacing between list items

### Keyboard Handling

- `KeyboardAvoidingView` with platform-specific behavior
- `keyboardShouldPersistTaps="handled"` for seamless interaction
- Extra padding in scroll containers for keyboard visibility

### Performance

- FlatList with `getItemLayout` for better scroll performance
- `removeClippedSubviews={true}` for memory optimization
- Limited render batch size and window size for smooth scrolling

## Dependencies Used

All dependencies are already present in the project:

- react-native-linear-gradient (for header gradient)
- react-native-vector-icons (for icons)
- react-native-safe-area-context (for safe area handling)
- react-native-size-matters (for responsive scaling)
- @react-navigation/native (for navigation)

## Testing

To test the screen:

1. Navigate to the SelectCity screen from your navigation flow
2. Test search functionality
3. Test city selection
4. Test the Next button functionality
