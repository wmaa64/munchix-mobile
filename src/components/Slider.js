import React, { useRef, useState, useEffect } from "react";
import { View, Image, ScrollView, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

const SLIDER_WIDTH = width ;
const SLIDER_HEIGHT = 180;

const Slider = ({ images }) => {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Auto-slide only once (no dependencies)
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        const nextIndex = (prev + 1) % images.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * SLIDER_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []); // <-- run once, not every index change

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(
            event.nativeEvent.contentOffset.x / SLIDER_WIDTH
          );
          setIndex(slideIndex);
        }}

        style={{ width: SLIDER_WIDTH, height: SLIDER_HEIGHT }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {images.map((img, i) => (
          <Image
            key={i}
            source={img}
            style={styles.slideImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: index === i ? 1 : 0.3 }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default Slider;

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    alignSelf: "center",      // <-- center horizontally
    justifyContent: "center", // <-- center vertically
    alignItems: "center",
    marginBottom: 5,
  },
  slideImage: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#000",
    borderRadius: 50,
    marginHorizontal: 4,
  },
});
