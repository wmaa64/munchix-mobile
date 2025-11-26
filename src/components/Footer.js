import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStateContext } from "../context/StateContext";

const Footer = () => {
  const navigation = useNavigation();
  const { totalQuantities } = useStateContext();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.container}>
        {/* Home */}
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.link}>Home</Text>
        </TouchableOpacity>

        {/* Cart */}
        <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.link}>Cart ({totalQuantities})</Text>
        </TouchableOpacity>

        {/* More */}
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={styles.link}>More ⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Popup Menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuBox}>

            <TouchableOpacity 
              onPress={() => { setMenuVisible(false); navigation.navigate("Cart"); }}>
              <Text style={styles.menuItem}>Order</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => { setMenuVisible(false); navigation.navigate("About"); }}>
              <Text style={styles.menuItem}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => { setMenuVisible(false); navigation.navigate("Contact"); }}>
              <Text style={styles.menuItem}>Contact</Text>
            </TouchableOpacity>

            <Text style={styles.copy}>© 2025 Munchix</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default Footer;

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#fff",
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    color: "#085cf8ff",
  },
 modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuItem: {
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 15,
    color: "#085cf8ff",
  },
  copy: {
    fontSize: 14,
    color: "#888",
  },
});
