// src/components/EmptyCart.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

export default function EmptyCart() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <MaterialIcons name="shopping-bag" size={100} color="#ccc" />
      <Text style={styles.title}>Your shopping bag is empty</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.btnText}>Go to Shop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 18,
    marginTop: 12,
    color: "#444",
  },
  btn: {
    marginTop: 16,
    backgroundColor: "#000",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
