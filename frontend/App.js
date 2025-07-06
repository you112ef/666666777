import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SplashScreen from 'expo-splash-screen';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import GraphScreen from './src/screens/GraphScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CameraScreen from './src/screens/CameraScreen';
import AnalysisDetailsScreen from './src/screens/AnalysisDetailsScreen';

// Import services and utils
import i18n from './src/locales/i18n';
import { theme } from './src/utils/theme';
import { AnalysisProvider } from './src/services/AnalysisContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Analysis') {
            iconName = 'biotech';
          } else if (route.name === 'Results') {
            iconName = 'assessment';
          } else if (route.name === 'Graphs') {
            iconName = 'insert-chart';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: i18n.t('tabs.home'),
          headerTitle: i18n.t('app.title')
        }} 
      />
      <Tab.Screen 
        name="Analysis" 
        component={AnalysisScreen} 
        options={{ 
          title: i18n.t('tabs.analysis'),
          headerTitle: i18n.t('tabs.analysis')
        }} 
      />
      <Tab.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ 
          title: i18n.t('tabs.results'),
          headerTitle: i18n.t('tabs.results')
        }} 
      />
      <Tab.Screen 
        name="Graphs" 
        component={GraphScreen} 
        options={{ 
          title: i18n.t('tabs.graphs'),
          headerTitle: i18n.t('tabs.graphs')
        }} 
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ 
          title: i18n.t('tabs.history'),
          headerTitle: i18n.t('tabs.history')
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: i18n.t('tabs.settings'),
          headerTitle: i18n.t('tabs.settings')
        }} 
      />
    </Tab.Navigator>
  );
}

// Stack Navigator for modal screens
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ 
          title: i18n.t('camera.title'),
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#000',
          },
        }} 
      />
      <Stack.Screen 
        name="AnalysisDetails" 
        component={AnalysisDetailsScreen}
        options={{ 
          title: i18n.t('analysis.details'),
        }} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // Keep the splash screen visible while we fetch resources
        
        // Initialize i18n
        await i18n.init();
        
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <AnalysisProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </AnalysisProvider>
        </I18nextProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}