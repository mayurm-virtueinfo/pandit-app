import { useNavigation, useNavigationState, useRoute, DrawerActions } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Imported icons
import { COLORS } from '../theme/theme';

interface CustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
}
const CustomHeader : React.FC<CustomHeaderProps> = ({
    title='',
    showBackButton = false,
    showMenuButton = false,
}) => {
    const headerHeight = 48; // Adjust based on your design
  const navigation = useNavigation();
  const inset = useSafeAreaInsets();
  const routes = useNavigationState(state => state.routes);
  const currentRoute = routes[routes.length - 1];

  return (
    <>
   <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
    
    <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.primary }}>
      <View
        style={{
          borderBottomColor:COLORS.gray,
          borderBottomWidth:2,
          height: headerHeight,
          backgroundColor: COLORS.primary,
          flexDirection: 'row',
          alignItems: 'center',
          // marginTop:inset.top,
          // paddingTop:inset.top
        //   paddingHorizontal: 16,
        }}>
        <View style={{width:headerHeight,height:headerHeight, justifyContent:'center',alignItems: 'center' }}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}
          {showMenuButton && (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              >
              <Ionicons name="menu" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}
          
        </View>
        <View style={{flex:1,justifyContent:'center',alignItems: 'center',height:'100%'}}>
            <Text style={{ color: COLORS.white, fontSize: 18 }}>{title}</Text>
        </View>
        <View style={{width:headerHeight,height:headerHeight, justifyContent:'center',alignItems: 'center' }}/>
      </View>
    </SafeAreaView>
    </>
    
  );
};

export default CustomHeader;
// This component can be used in your main app layout or specific screens
