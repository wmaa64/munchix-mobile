// src/components/Layout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from './Navbar';
import HeaderLogo from './HeaderLogo';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderLogo />

      <View style={styles.main}>
        {children}
      </View>

      <Footer />
    </SafeAreaView>
  );
}

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
