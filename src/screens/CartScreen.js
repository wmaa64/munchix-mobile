// src/screens/CartScreen.js
import React, { useEffect, useState } from "react";
import {View, Text, FlatList, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
        KeyboardAvoidingView, Platform, Linking} from "react-native";
//import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStateContext } from "../context/StateContext";
import EmptyCart from "../components/EmptyCart";
import { formatCurrency } from "../utils/format";
import { useStripe } from "@stripe/stripe-react-native";
import { BASE_URL } from "../config";


const CartScreen = ({ navigation }) => {
  const { showAlert, cartItems, totalPrice, totalQuantities, toggleCartItemQuantity, onRemove,  } = useStateContext();
  //const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Validate email + phone
  useEffect(() => {
    validateInputs(email, mobile);
  }, [email, mobile]);

  const validateInputs = (emailText, phoneText) => {
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailText);
    const phoneOK = /^\d{11}$/.test(phoneText);
    setIsValid(emailOK && phoneOK);
  };

  // Backup cart to AsyncStorage (mobile equivalent of localStorage)
  const backupCart = async () => {
    try {
      await AsyncStorage.setItem("cartBackup", JSON.stringify(cartItems));
    } catch (err) {
      console.log("Backup cart error:", err);
    }
  };

  // Stripe Checkout (PaymentSheet)
  const handleCheckout = async () => {
    if (!isValid) {
      showAlert("Validation", "Please enter a valid email and an 11-digit phone number.");
      return;
    }

    try {
      await backupCart();
      setLoading(true);

      // Call backend to create PaymentIntent
      const res = await fetch(`${BASE_URL}/api/stripe/create-payment-sheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          email,
          mobile,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.log("Stripe error:", errText);
        throw new Error("Failed to initialize payment.");
      }

      const data = await res.json();
      const clientSecret =
        data.paymentIntent ||
        data.clientSecret ||
        data.paymentIntentClientSecret;

      if (!clientSecret) {
        showAlert("Error", "Stripe did not return a payment secret.");
        setLoading(false);
        return;
      }

      // Initialize Stripe Sheet
      const initSheet = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Munchix",
      });

      if (initSheet.error) {
        showAlert("Payment Error", initSheet.error.message);
        setLoading(false);
        return;
      }

      // Present Sheet
      const result = await presentPaymentSheet();

      if (result.error) {
        showAlert("Payment Failed", result.error.message);
        navigation.replace("Canceled");
        return;
      } else {
        showAlert("Success", "Payment completed!");

        const paymentIntentId = clientSecret.split("_secret")[0];

        navigation.replace("Success", {
              paymentIntentId, // PaymentIntent Id
              email,
              mobile,
            });
      }

    } catch (err) {
      console.log("Checkout error:", err);
      showAlert("Checkout Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render cart item row
  const renderItem = ({ item }) => (
    <View style={styles.productRow}>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(item)}
      >
        <Text style={{ color: "red", fontSize: 16, fontWeight: "bold" }}>
          ✕
        </Text>
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.productImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>
          {item.displayName || item.name?.en || item.name}
        </Text>

        {/* Show meal selected items if meal-type */}
        {item.producttype === "meal" &&
          item.selectedCategories?.length > 0 && (
            <View style={{ marginTop: 6 }}>
              {item.selectedCategories.map((cat, i) => (
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: "700" }}>
                    {cat.category}:
                  </Text>
                  <Text>
                    {cat.selectedItems.map((si, idx) => (
                      <Text key={idx}>
                        {si.quantity}x {si.product?.name?.en}
                        {idx < cat.selectedItems.length - 1 ? " + " : ""}
                      </Text>
                    ))}
                  </Text>
                </View>
              ))}
            </View>
          )}

        <Text style={styles.qtyPrice}>
          {item.quantity} × {item.price} EGP
        </Text>

        {/* Controls */}
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            onPress={() => toggleCartItemQuantity(item._id, "dec")}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>–</Text>
          </TouchableOpacity>

          <Text style={styles.qtyNumber}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => toggleCartItemQuantity(item._id, "inc")}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // If no items
  if (!cartItems || cartItems.length === 0) return <EmptyCart />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Use only FlatList — no ScrollView to avoid nested error */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              Your Cart ({totalQuantities} items)
            </Text>
          </>
        }
        ListFooterComponent={
          <>
            {/* Customer Info */}
            <View style={styles.customerInfo}>
              <Text style={styles.label}>Enter Valid Email:</Text>
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  validateInputs(t, mobile);
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>
                Enter Phone Number (11 digits):
              </Text>
              <TextInput
                value={mobile}
                onChangeText={(t) => {
                  setMobile(t);
                  validateInputs(email, t);
                }}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* Subtotal */}
            <View style={styles.subtotal}>
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                Subtotal:
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                {formatCurrency(totalPrice)}
              </Text>
            </View>

            {/* Checkout button */}
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                onPress={handleCheckout}
                disabled={!isValid || loading}
                style={[
                  styles.checkoutBtn,
                  { opacity: !isValid || loading ? 0.5 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.checkoutText}>Pay with Stripe</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </KeyboardAvoidingView>
  );
}

export default CartScreen;

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: "700" },

  productRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    elevation: 1,
  },
  removeBtn: { padding: 6, marginRight: 6 },
  productImage: { width: 90, height: 90, borderRadius: 10, backgroundColor: "#eee" },

  itemDetails: { flex: 1, marginLeft: 10 },
  itemTitle: { fontSize: 16, fontWeight: "700" },
  qtyPrice: { marginTop: 8, color: "#444" },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  qtyBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "#000",
    borderRadius: 6,
  },
  qtyBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  qtyNumber: { width: 30, textAlign: "center", fontSize: 16 },

  customerInfo: { marginTop: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },

  subtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },

  checkoutBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
