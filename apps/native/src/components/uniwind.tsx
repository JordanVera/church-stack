import { withUniwind } from 'uniwind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

export const SafeAreaView = withUniwind(RNSafeAreaView);
export const LinearGradient = withUniwind(ExpoLinearGradient);
