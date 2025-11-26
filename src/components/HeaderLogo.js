import React from "react";
import { View, Image, StyleSheet } from "react-native";

const logoImage =  require("../../assets/MunchixLogo1.jpg");

const HeaderLogo = () => {
  return (
    <View style={styles.container}>
      <Image
        source={logoImage}
        style={styles.logoImage}
        resizeMode="cover"
      />
    </View>
  );
}

export default HeaderLogo;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "5%",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "black",
  },
  logoImage: {
    width: "20%",
    height: "100%",
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
