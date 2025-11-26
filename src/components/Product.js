import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Product = ({ product }) => {
  const navigation = useNavigation();

  const handlePress = () => {
        if (product.producttype === "meal") {
            navigation.navigate("Meal", {
                id: product._id,  // same as web: /product/[id]
                product,
            });      
        } else if (product.producttype === "item") {
            navigation.navigate("Product", {
            id: product._id,  // same as web: /product/[id]
            product,
            });
        }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardTextBox}>
        <Text style={styles.name}>{product.name.en}</Text>
        <Text style={styles.description}>{product.description.en}</Text>
        <Text style={styles.price}>{product.price} EGP</Text>
      </View>

      <View style={styles.cardImageBox}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="stretch"
        />      
      </View>


    </TouchableOpacity>
  );
}

export default Product;

const styles = StyleSheet.create({
  card: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTextBox: {
    flex: 2/3,
    paddingRight: 2,
  },
  cardImageBox: {
    flex: 1/3,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },
  name: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "800",
    color: "#f7d305ff", 
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "ultralight",
  },
  price: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#ff6a00",
  },
});
