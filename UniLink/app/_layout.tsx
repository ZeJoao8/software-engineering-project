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

   <Stack>

    {/* ecrã inicial */}
    <Stack.Screen

     name="index"

     options={{
      headerShown: false
     }}

    />

    {/* tabs */}
    <Stack.Screen

     name="(tabs)"

     options={{
      headerShown: false
     }}

    />

   </Stack>

   <StatusBar style="auto" />

  </ThemeProvider>

 );

}