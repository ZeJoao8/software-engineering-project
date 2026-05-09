import {
 DarkTheme,
 DefaultTheme,
 ThemeProvider
} from '@react-navigation/native';

import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '../styles/theme';

export default function RootLayout() {

 const colorScheme =
  useColorScheme();

 return (

  <ThemeProvider
   value={
    colorScheme === 'dark'
     ? DarkTheme
     : DefaultTheme
   }
  >

   <Stack
    screenOptions={{
     headerShown: false
    }}
   >

    <Stack.Screen name="index" />

    <Stack.Screen name="(tabs)" />

    <Stack.Screen 
      name="createRide" 
      options={{ headerShown: false }} 
    />

    <Stack.Screen name="ride/[id]" />

    <Stack.Screen name="review/[id]" />
    
    <Stack.Screen name="reviewComment/[id]" />

    <Stack.Screen name="reportUser/[id]" />

   </Stack>

   <StatusBar style="auto" />

  </ThemeProvider>

 );

}