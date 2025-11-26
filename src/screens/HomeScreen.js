import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, FlatList, Dimensions } from "react-native";
//import Layout from "../components/Layout";
import Product from "../components/Product";
//import HeaderHero from "../components/HeaderHero";
import Slider from "../components/Slider";
//import HeaderLogo, { logoImage } from "../components/HeaderLogo";
import { BASE_URL } from "../config";

const { width } = Dimensions.get("window");
const numColumns = Math.floor(width / (width * 0.25) ); // Approx 4 items per row

export const sliderImages = [
  require("../../assets/slider/image1.jpg"),
  require("../../assets/slider/image2u.jpg"),
  require("../../assets/slider/image3u.jpg"),
  require("../../assets/slider/image4u.jpg"),
  require("../../assets/slider/image5u.jpg"),
  require("../../assets/slider/image6u.jpg"),
  require("../../assets/slider/image7u.jpg"),
];

//const sliderImages = [];

const  HomeScreen = () => {
  const [products, setProducts] = useState([]);

  // Fetch products on mount (same API as your web version)
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.log("Failed to load products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ScrollView style={styles.container}>
        <Slider images={sliderImages} />
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Our Products</Text>
        </View>

        <FlatList
        data={products}
        scrollEnabled={false}
        keyExtractor={(item) => item._id}
        numColumns={1}
        renderItem={({ item }) => <Product product={item} />}
        contentContainerStyle={styles.list}
        />
    </ScrollView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: {
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  list: {
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
});
