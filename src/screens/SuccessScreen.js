// src/screens/SuccessScreen.js
import React, { useEffect } from "react";
import {  View,  Text,  StyleSheet,  TouchableOpacity,  ActivityIndicator,} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useStateContext } from "../context/StateContext";
import { BASE_URL } from "../config";

const SuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentIntentId , email, mobile } = route.params || {};

  const { setCartItems, setTotalPrice, setTotalQuantities,clearCart } = useStateContext();

  useEffect(() => {
    if (!paymentIntentId || !email || !mobile) {
      console.log("Missing required payment data");
      return;
    }

    const saveOrder = async () => {
      try {
        /*
        // 1️⃣ Get Stripe session
        const res = await fetch(`${BASE_URL}/api/stripe/stripe-session?session_id=${session_id}`);
        const session = await res.json();
        */

        // 2️⃣ Get cart backup
        const cartBackup = await AsyncStorage.getItem("cartBackup");
        let itemsOfCart = cartBackup ? JSON.parse(cartBackup) : [];

        if (!itemsOfCart || itemsOfCart.length === 0) {
          console.log("❌ No cart items found");
          return;
        }

        //console.log("📦 Items to save:", itemsOfCart);

        // 3️⃣ Format cart items
        const formattedItems = itemsOfCart.map((item) => {
          if (item.producttype === "meal" && Array.isArray(item.selectedCategories)) {
            return {
              productId: item._id,
              name: item.name,
              displayName: item.displayName || item.name?.en || "",
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              selectedCategories: item.selectedCategories.map((cat) => ({
                category: cat.category,
                selectedItems: (cat.selectedItems || []).map((s) => ({
                  name: s.product?.name?.en || "",
                  price: s.product?.price || 0,
                  quantity: s.quantity,
                  image: s.product?.image || "",
                })),
              })),
            };
          }

          return {
            productId: item._id,
            name: item.name,
            displayName: item.displayName || item.name?.en || "",
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          };
        });

        // 4️⃣ Save the order
        await fetch(`${BASE_URL}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: formattedItems,
            email,
            mobile,
            paymentIntentId,
          }),
        });

        console.log("✔ Order saved successfully");

      } catch (err) {
        console.error("❌ Error saving order:", err);
      } finally {
        // 5️⃣ Clear cart
        await AsyncStorage.removeItem("cartBackup");
        clearCart();
      }
    };

    saveOrder();
  }, [paymentIntentId, email, mobile]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.box}>
        <Text style={styles.title}>🎉 Thank you for your order!</Text>
        <Text style={styles.text}>A receipt has been sent to your email.</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },
  button: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
