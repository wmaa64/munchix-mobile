import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const HeaderHero = () => {
  return (
    <View style={styles.container}>
      {/*<Image
        source={{ uri: "https://your-image-url.com/hero.jpg" }}
        style={styles.heroImage}
        resizeMode="cover"
      />*/}

      <Text style={styles.title}>Welcome to Munchix</Text>
      <Text style={styles.subtitle}>Delicious meals delivered fast</Text>
    </View>
  );
}

export default HeaderHero;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  heroImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    color: "#666",
  },
});
