import { Image, Text, View } from "react-native";

import Pressable from "./HapticPressable";
import { openPaymentLink } from "../utils/openPaymentLink";
import styles from "../styles/shopStyles";

export default function ProductCard({ product }) {
  return (
    <Pressable
      style={styles.productCard}
      onPress={() => openPaymentLink(product.paymentUrl)}
    >
      <Image
        source={product.image}
        style={styles.productImage}
        resizeMode="cover"
      />

      <View style={styles.productTextWrap}>
        <Text style={styles.productName}>{product.name}</Text>

        <Text style={styles.productPrice}>{product.price}</Text>

        <Text style={styles.productDescription}>{product.description}</Text>

        <Text style={styles.productIncludesTitle}>Includes</Text>

        {product.includes.map((item) => (
          <Text key={item} style={styles.productIncludesItem}>
            {item}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}
