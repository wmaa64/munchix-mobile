// App.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from './src/config'; // Your publishable key
import { StateProvider } from './src/context/StateContext';
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import Layout  from './src/components/Layout';

import RootNavigator from './src/navigation/RootNavigator'; 
// We create RootNavigator next (it replaces Next.js routing)

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StateProvider >      
        <SafeAreaView style={styles.container}>  
          <NavigationContainer>
            <Layout >
              <RootNavigator />
            </Layout>
          </NavigationContainer>
        </SafeAreaView >
      </StateProvider >
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});




/*
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
*/