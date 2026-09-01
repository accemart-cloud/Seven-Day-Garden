import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { Karla_400Regular, Karla_500Medium, Karla_600SemiBold, Karla_700Bold } from '@expo-google-fonts/karla';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppShell from './src/screens/AppShell';
import FavoritesScreen from './src/screens/FavoritesScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import NameScreen from './src/screens/NameScreen';
import StartedScreen from './src/screens/StartedScreen';
import { GardenProvider, useGarden } from './src/state/GardenContext';
import { colors } from './src/theme';

function RootNavigator() {
  const { state, ready } = useGarden();
  if (!ready) return null;
  switch (state.screen) {
    case 'name':
      return <NameScreen />;
    case 'started':
      return <StartedScreen />;
    case 'fav':
      return <FavoritesScreen />;
    case 'goals':
      return <GoalsScreen />;
    case 'app':
    default:
      return <AppShell />;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Karla_400Regular,
    Karla_500Medium,
    Karla_600SemiBold,
    Karla_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GardenProvider>
        <View style={styles.root}>
          <StatusBar style="dark" />
          <RootNavigator />
        </View>
      </GardenProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  root: { flex: 1, backgroundColor: colors.cream },
});
