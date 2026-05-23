import { Text, View } from "react-native";

import styles from "../styles/shopStyles";

export default function ShippingPromo() {
  return (
    <View style={styles.shippingWrap}>
      <View style={styles.shippingPill}>
        <Text style={styles.shippingText}>12 hour shipping</Text>
      </View>

      <Text style={styles.shippingConnector}>+</Text>

      <View style={styles.shippingPill}>
        <Text style={styles.shippingText}>$10 delivery fee</Text>
      </View>

      <Text style={styles.shippingConnector}>in</Text>

      <View style={styles.shippingPill}>
        <Text style={styles.shippingText}>M. Dade / Broward</Text>
      </View>
    </View>
  );
}