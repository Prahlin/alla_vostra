import { Animated, Image, Text, View } from "react-native";
import { useEffect } from "react";

import PageDivider from "../components/PageDivider";
import productsStyles from "../styles/productsStyles";
import { useHeaderScrollY } from "../utils/headerScrollContext";
import useMainScreenSwipeNavigation from "../utils/useMainScreenSwipeNavigation";

const products = [
  {
    title: "Piccola",
    serving:
      "Serving 4 guests, this mouthwatering treat is a staple at Alla Vostra that features a curated selection of the finest cheeses and charcuterie available in South Florida.",
    image: require("../janny1brevised.png"),
    alt: "Alla Vostra Piccola grazing board",
    includes: [
      {
        title: "3 Types of Meat",
        amount: "10oz",
        items: ["Salame (Calabrese, Di Parma, Genoa)*", "Prosciutto*", "Coppa"],
        note: "*exact types of meat may vary",
      },
      {
        title: "4 Types of Cheese",
        amount: "12oz",
        items: ["Gouda", "Brie", "Cheddar", "Parmessano"],
      },
      {
        title: "A Selection of Accoutrements",
        amount: "Varies",
        items: ["Fruits", "Nuts*", "Starches", "Jam"],
        note: "*replaceable in case of allergies",
      },
    ],
  },
  {
    title: "Sei Perfetto",
    serving:
      "Serving 6 guests, this irresistible delicacy captures the true essence of what it feels like to be around beloved family, trusted friends, and loyal clients.",
    image: require("../janny2drevised.png"),
    alt: "Alla Vostra Sei Perfetto grazing board",
    includes: [
      {
        title: "3 Types of Meat",
        amount: "15oz",
        items: ["Salame (Calabrese, Di Parma, Genoa)*", "Prosciutto*", "Coppa"],
        note: "*exact types of meat may vary",
      },
      {
        title: "4 Types of Cheese",
        amount: "18oz",
        items: ["Gouda", "Brie", "Cheddar", "Parmessano"],
      },
      {
        title: "A Selection of Accoutrements",
        amount: "Varies",
        items: ["Fruits", "Nuts*", "Starches", "Jam", "Chocolate"],
        note: "*replaceable in case of allergies",
      },
    ],
  },
  {
    title: "Buon Natale",
    serving:
      "Serving 8 guests, this generous board brings a full Alla Vostra spread to larger gatherings, celebrations, and holiday tables.",
    image: require("../janny3erevised.png"),
    alt: "Alla Vostra Buon Natale grazing board",
    includes: [
      {
        title: "3 Types of Meat",
        amount: "20oz",
        items: ["Salame (Calabrese, Di Parma, Genoa)*", "Prosciutto*", "Coppa"],
        note: "*exact types of meat may vary",
      },
      {
        title: "4 Types of Cheese",
        amount: "24oz",
        items: ["Gouda", "Brie", "Cheddar", "Parmessano"],
      },
      {
        title: "A Selection of Accoutrements",
        amount: "Varies",
        items: ["Fruits", "Nuts*", "Starches", "Jam", "Chocolate"],
        note: "*replaceable in case of allergies",
      },
    ],
  },
];

function ProductSection({ product }) {
  return (
    <View style={productsStyles.productCard}>
      <View style={productsStyles.productImageWrap}>
        <Image
          source={product.image}
          style={productsStyles.productImage}
          resizeMode="contain"
          accessibilityLabel={product.alt}
        />
      </View>

      <Text style={productsStyles.productTitle}>{product.title}</Text>
      <Text style={productsStyles.productDescription}>{product.serving}</Text>

      <View style={productsStyles.productDetails}>
        {product.includes.map((section) => (
          <View key={section.title} style={productsStyles.includeSection}>
            <View style={productsStyles.includeHeaderRow}>
              <Text style={productsStyles.includeTitle}>{section.title}</Text>
              <Text style={productsStyles.includeAmount}>{section.amount}</Text>
            </View>

            {section.items.map((item) => (
              <Text key={item} style={productsStyles.includeItem}>
                → {item}
              </Text>
            ))}

            {section.note ? (
              <Text style={productsStyles.includeNote}>{section.note}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProductsScreen() {
  const scrollY = useHeaderScrollY();
  const screenSwipeHandlers = useMainScreenSwipeNavigation();

  useEffect(() => {
    scrollY?.setValue(0);
  }, [scrollY]);

  return (
    <View style={productsStyles.screen} {...screenSwipeHandlers}>
      <Animated.ScrollView
        style={productsStyles.scroll}
        contentContainerStyle={productsStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={productsStyles.main}>
          <Text style={productsStyles.pageTitle}> </Text>

          <PageDivider />

          {products.map((product, index) => (
            <View key={product.title}>
              <ProductSection product={product} />
              {index < products.length - 1 ? <PageDivider /> : null}
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
