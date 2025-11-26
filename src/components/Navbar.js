import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStateContext } from "../context/StateContext";

const  Navbar = () => {
  const navigation = useNavigation();
  const { totalQuantities } = useStateContext();

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        
        {/* Home */}
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.link}>Home</Text>
        </TouchableOpacity>

        {/* Cart */}
        <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.link}>Cart ({totalQuantities})</Text>
        </TouchableOpacity>

        {/* Login */}
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default Navbar;

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#fff",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  link: {
    fontSize: 16,
    fontWeight: "600",
  },
});
