import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar, { TabKey } from '../components/TabBar';
import { useGarden } from '../state/GardenContext';
import { colors } from '../theme';
import BreathingScreen from './BreathingScreen';
import GardenSheet from './GardenSheet';
import HistoryScreen from './HistoryScreen';
import HomeScreen from './HomeScreen';

export default function AppShell() {
  const { state, save } = useGarden();

  const goTab = (k: TabKey) => {
    if (k === 'home') save({ view: 'home' });
    else if (k === 'cal') save({ view: 'cal', selKey: null });
    else save({ screen: 'fav', view: 'fav' });
  };

  const activeTab: TabKey = state.view === 'cal' ? 'cal' : state.view === 'breath' ? 'home' : 'home';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={{ flex: 1 }}>
        {state.view === 'home' && <HomeScreen />}
        {state.view === 'cal' && <HistoryScreen />}
        {state.view === 'breath' && <BreathingScreen />}
      </View>
      <TabBar active={activeTab} onSelect={goTab} />
      {state.showTree && <GardenSheet />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
});
