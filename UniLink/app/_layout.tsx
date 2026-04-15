import {
 DarkTheme,
 DefaultTheme,
 ThemeProvider
} from '@react-navigation/native';

import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import 'react-native-reanimated';

import { useColorScheme }
 from '@/hooks/use-color-scheme';

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

    <Stack.Screen name="ride/[id]" />

    <Stack.Screen name="review/[id]" />
    
    <Stack.Screen name="report/[id]" />

    <Stack.Screen name="reportPassenger/[id]" />

   </Stack>

   <StatusBar style="auto" />

  </ThemeProvider>

 );

}