import React, { useState, useEffect } from "react";
import {  View,  Text,  Image,  ScrollView,  TouchableOpacity,  ActivityIndicator,  StyleSheet,} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useStateContext } from "../context/StateContext";
import { BASE_URL } from "../config";


const ProductScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params; // Next.js used router.query.id

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { decQty, incQty, qty, onAdd } = useStateContext();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const productRes = await fetch(`${BASE_URL}/api/products/${id}`);
        const productData = await productRes.json();

        const productsRes = await fetch(`${BASE_URL}/api/products`);
        const productsData = await productsRes.json();

        console.log("PRODUCT DATA:", productData);

        setProduct(productData);
        setRelatedProducts(productsData);
      } catch (err) {
        console.log("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /*
  const handleBuyNow = () => {
    if (!product) return;
    onAdd(product, qty);
    setShowCart(true);
    Alert.alert("Success", "Item added to your cart!");
  };
*/

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Product Image */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Details */}
      <View style={styles.content}>
        <Text style={styles.title}>{product.name?.en || "Product"}</Text>

        {/* Stars */}
        <Text style={styles.stars}>⭐ 4.5 (20 reviews)</Text>

        <Text style={styles.label}>Details:</Text>
        <Text style={styles.description}>
          {product.description?.en || "No description"}
        </Text>

        {/* Price */}
        <Text style={styles.price}>
          {product.price} <Text style={{ fontSize: 14 }}>EGP</Text>
        </Text>

        {/* Quantity */}
        <View style={styles.quantityBox}>
          <Text style={styles.qtyTitle}>Quantity:</Text>

          <View style={styles.qtyButtons}>
            <TouchableOpacity onPress={decQty} style={styles.qtyBtn}>
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyNumber}>{qty}</Text>

            <TouchableOpacity onPress={incQty} style={styles.qtyBtn}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SKU */}
        <Text style={styles.sku}>SKU: {product._id}</Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.addToCart}
            onPress={() => onAdd(product, qty)}
          >
            <Text style={styles.btnTextWhite}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addToCart}
            onPress={() => navigation.navigate("Cart") }
          >
            <Text style={styles.btnTextWhite}>Buy Now</Text>
          </TouchableOpacity>


        </View>
      </View>

      {/* Related Products */}
      <View style={styles.relatedBox}>
        <Text style={styles.relatedTitle}>You may also like</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {relatedProducts.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.relatedItem}
              onPress={() => navigation.push("Product", { id: item._id })}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.relatedImage}
              />
              <Text style={styles.relatedName}>
                {item.name?.en || "Product"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

    </ScrollView>
  );
}

export default ProductScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  imageBox: { width: "40%", height: 200, margin: 16 },
  image: { width: "100%", height: "100%" },

  content: { padding: 16 },

  title: { fontSize: 24, fontWeight: "700", marginBottom: 10 },

  stars: { fontSize: 16, color: "#777", marginBottom: 10 },

  label: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  description: { fontSize: 14, color: "#444", marginTop: 4 },

  price: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 15,
    color: "#e67500",
  },

  quantityBox: { marginTop: 20 },
  qtyTitle: { fontSize: 18, fontWeight: "600" },
  qtyButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  qtyBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { fontSize: 22, fontWeight: "800" },
  qtyNumber: { fontSize: 18, marginHorizontal: 12 },

  sku: { marginTop: 20, color: "#666" },

  buttons: { marginTop: 30, gap: 12 },

  addToCart: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
  },
  addToBag: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    padding: 15,
    borderRadius: 8,
  },
  buyNow: {
    backgroundColor: "#ff2d55",
    padding: 15,
    borderRadius: 8,
  },

  btnTextWhite: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  btnTextBlack: {
    color: "#000",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  relatedBox: { padding: 16 },
  relatedTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },

  relatedItem: { marginRight: 12, width: 120 },
  relatedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  relatedName: { marginTop: 6, fontSize: 14, textAlign: "center" },
});

