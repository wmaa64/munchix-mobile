// src/screens/MealScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {  View,  Text, Image,  ScrollView,  TouchableOpacity,  ActivityIndicator,  StyleSheet} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useStateContext } from "../context/StateContext";
import { BASE_URL } from "../config";

/**
 * Meal builder screen converted from src/pages/meal/[id].js
 * Keeps same logic and state names used in the web version.
 *
 * NOTE: update the API_BASE to match your backend host when running on a device.
 */


const MealScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params; // Next.js used router.query.id
  //console.log("MealScreen ID:", id);
  
  const { showAlert, decQty, incQty, qty, onAdd, setShowCart } = useStateContext();

  const [meal, setMeal] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  // selectedItems: { [category]: { [productId]: { product, quantity } } }
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!id) return;

  const fetchMeal = async () => {
    try {
      const mealRes = await fetch(`${BASE_URL}/api/products/${id}`);
      const mealData = await mealRes.json();

      const allProductsRes = await fetch(`${BASE_URL}/api/products`);
      const allData = await allProductsRes.json();

      setMeal(mealData);
      setAllProducts(allData);
    } catch (error) {
      console.error("Error loading meal:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchMeal();
}, [id]);


  // Helper: get product object by id from allProducts (if needed)
  const findProductById = (prodId) => {
    return allProducts.find((p) => p._id === prodId || p.id === prodId) || null;
  };

  // Toggle / set selection for a given category and product
  const setSelectedQuantity = (category, product, quantity) => {
    setSelectedItems((prev) => {
      const prevCat = { ...(prev[category] || {}) };
      if (quantity <= 0) {
        delete prevCat[product._id || product.id];
      } else {
        prevCat[product._id || product.id] = {
          product,
          quantity,
        };
      }
      return { ...prev, [category]: prevCat };
    });
  };

  // Increase/decrease a selected item within a category
  const changeSelectedItemQty = (category, productId, delta) => {
    setSelectedItems((prev) => {
      const prevCat = { ...(prev[category] || {}) };
      const entry = prevCat[productId];
      if (!entry) return prev;
      const newQty = Math.max(0, (entry.quantity || 0) + delta);
      if (newQty <= 0) {
        delete prevCat[productId];
      } else {
        prevCat[productId] = { ...entry, quantity: newQty };
      }
      return { ...prev, [category]: prevCat };
    });
  };

    // Build selectedCategories from current selectedItems state
  const selectedCategories = (meal)? 
    Object.entries(selectedItems).map(([category, productsMap]) => {
      const selectedItemsList = Object.entries(productsMap)
        .map(([productId, { quantity }]) => {
          if (!quantity || quantity <= 0) return null;
          const product = allProducts.find((p) => p._id === productId);
          if (!product) return null; 
          return {
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
            },
            quantity,
          };
        })
        .filter(Boolean);

      return selectedItemsList.length > 0
        ? { category, selectedItems: selectedItemsList }
        : null;
    })
    .filter(Boolean)
    : [];

  

  const selectedTotal = (meal)?
    selectedCategories.reduce(
    (sum, cat) =>
      sum +
      cat.selectedItems.reduce(
        (s, si) => s + (si.product?.price || 0) * si.quantity,
        0
      ),
    0
  ): 0;

  const totalPrice = (meal)?
    meal.price > 0
      ? meal.price + (meal.overprice || 0)
      : selectedTotal + (meal.overprice || 0)
      : 0;


  const summary  = (meal)?
      (meal.overprice != 0)?  
        ( selectedCategories.map((cat) =>
          `${cat.category}: ${cat.selectedItems.map((si) => 
              `${si.quantity}x ${si.product?.name?.en  || si.product?.name} @ ${si.product?.price } EGP`).join(" + ")}`
        ).join(" | ")).concat( ` | Overprice: ${meal.overprice} EGP` )

      : (selectedCategories.map((cat) =>
          `${cat.category}: ${cat.selectedItems.map((si) => 
              `${si.quantity}x ${si.product?.name?.en  || si.product?.name}`).join(" + ")}`
        ).join(" | "))
        : "";


  // Validate required selections like web did
  const validateSelections = () => {
    if (!meal || !meal.mealComponents) return true; // nothing to validate
    for (let comp of meal.mealComponents) {
      const cat = selectedItems[comp.category] || {};
      const totalInCategory = Object.values(cat).reduce(
        (acc, it) => acc + (it.quantity || 0),
        0
      );

      console.log("totalInCategory:", totalInCategory);

      if (totalInCategory !== comp.quantity) {
        return {
          ok: false,
          message: `Please select ${comp.quantity} item(s) for ${comp.category}. Currently selected: ${totalInCategory}`,
        };
      }
    }
    return { ok: true };
  };

  // Add meal to cart (keeps same payload shape as web's onAdd)
  const handleAddMeal = () => {
    if (!meal) return;
    const check = validateSelections();
    if (!check.ok) {
      showAlert("Validation", check.message || "Please complete meal selections");
      return;
    }

    //const chosenSummary = makeSummary();

    const fullMeal = {
      ...meal,
      producttype: "meal",
      selectedCategories,
      price: totalPrice,
      totalPrice,
      quantity: qty,
      image: meal.image,
      displayName: `${meal.name.en} (${summary})`,
      };

    console.log("Adding full meal to cart:", fullMeal);
    onAdd(fullMeal, qty);
    setShowCart(true);
    showAlert("Success", `Meal added to basket! Total: ${totalPrice} EGP`);

    navigation.navigate("Cart");
  };

  // UI handlers for product selection in a meal component
  const addProductToCategory = (category, product) => {
    const idKey = product._id || product.id;
    setSelectedItems((prev) => {
      const prevCat = { ...(prev[category] || {}) };
      const existing = prevCat[idKey];
      const qtyToSet = existing ? existing.quantity + 1 : 1;
      prevCat[idKey] = { product, quantity: qtyToSet };
      return { ...prev, [category]: prevCat };
    });
  };

  const removeProductFromCategory = (category, productId) => {
    setSelectedItems((prev) => {
      const prevCat = { ...(prev[category] || {}) };
      delete prevCat[productId];
      return { ...prev, [category]: prevCat };
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.center}>
        <Text>Meal not found</Text>
      </View>
    );
  }

  // Render UI: meal info, categories and their selectable products (using allProducts lookup)
  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: meal.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>
          {(meal.name && (meal.name.en || meal.name)) || meal.title || "Meal"}
        </Text>
        <Text style={styles.price}>{totalPrice} EGP</Text>
      </View>

      {/* Meal description if any */}
      {meal.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>{meal.description.en}</Text>
        </View>
      ) : null}

      {/* Iterate meal components (categories) */}
      {(meal.mealComponents || []).map((comp, ci) => {
        // comp example: { category: "Main", min: 1, max: 2, products: [id1,id2,...] }
        const compProducts = (comp.products || []).map((prodId) => {
          // find full product either inside allProducts or maybe comp provides product objects
          const found =
            (allProducts && allProducts.find((p) => p._id === prodId || p.id === prodId)) ||
            prodId; // if product object present already
          return typeof found === "object" ? found : findProductById(prodId) || { _id: prodId, name: prodId, price: 0 };
        });

        const selectedMap = selectedItems[comp.category] || {};

        return (
          <View key={ci} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {comp.category.toUpperCase()} (Choose {comp.quantity})
            </Text>

            {/* list products for this category */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {compProducts.map((prod) => {
                const pid = prod._id || prod.id;
                const sel = selectedMap[pid];
                return (
                  <View key={pid} style={styles.relatedBox}>
                    <View style={{ flex: 1 }}>  
                        <Image
                          source={{ uri: prod.image }}
                          style={styles.relatedImage}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.prodName}>
                        {prod.name?.en || prod.name || prod.title || pid}
                      </Text>
                      <Text style={styles.prodPrice}>{prod.price || 0} EGP</Text>
                    </View>

                    {/* selection controls */}
                    {sel ? (
                      <View style={styles.qtyRow}>
                        <TouchableOpacity
                          onPress={() => changeSelectedItemQty(comp.category, pid, -1)}
                          style={styles.qtyBtn}
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.qtyNumber}>{sel.quantity}</Text>

                        <TouchableOpacity
                          onPress={() => changeSelectedItemQty(comp.category, pid, +1)}
                          style={styles.qtyBtn}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => removeProductFromCategory(comp.category, pid)}
                          style={styles.removeBtn}
                        >
                          <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => addProductToCategory(comp.category, prod)}
                        style={styles.addBtnSmall}
                      >
                        <Text style={styles.addBtnSmallText}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

            </ScrollView>
          </View>
        );
      })}

      {/* Summary of selected categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selected</Text>
        {selectedCategories.length === 0 ? (
          <Text style={styles.sectionText}>No items selected</Text>
        ) : (
          selectedCategories.map((cat, i) => (
            <View key={i} style={styles.selectedCat}>
              <Text style={styles.catTitle}>{cat.category}</Text>
              {cat.selectedItems.map((si, j) => (
                <Text key={j} style={styles.sectionText}>
                  {si.quantity} x {si.product?.name?.en || si.product?.name} — {si.product?.price || 0} EGP
                </Text>
              ))}
            </View>
          ))
        )}
      </View>

      {/* Quantity controls for whole meal (uses same qty from context) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Quantity</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={decQty} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNumber}>{qty}</Text>
          <TouchableOpacity onPress={incQty} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add meal to basket */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleAddMeal}>
          <Text style={styles.primaryText}>Add Meal to Basket • {totalPrice} EGP</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default MealScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  relatedBox: { padding: 16 },
  relatedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  imageBox: { width: "40%", height: 200, margin: 16 },
  image: { width: "100%", height: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 16, borderBottomWidth: 0.5, borderColor: "#eee" },
  title: { fontSize: 22, fontWeight: "700" },
  price: { marginTop: 6, fontSize: 18, fontWeight: "600", color: "#ff6a00" },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  sectionText: { fontSize: 14, color: "#444", marginBottom: 6 },
  prodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  prodName: { fontSize: 15, fontWeight: "600" },
  prodPrice: { fontSize: 14, color: "#666" },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  qtyBtnText: { fontSize: 18, fontWeight: "700" },
  qtyNumber: { marginHorizontal: 12, fontSize: 16 },
  addBtnSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#000",
    borderRadius: 6,
  },
  addBtnSmallText: { color: "#fff", fontWeight: "700" },
  removeBtn: { marginLeft: 10, paddingHorizontal: 8 },
  removeText: { color: "red", fontSize: 13 },
  selectedCat: { marginBottom: 8 },
  catTitle: { fontWeight: "700" },
  primaryBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
