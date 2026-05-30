import { View } from "react-native";

import sharedStyles from "../styles/sharedStyles";

export default function PageDivider({ expandedSpacing = false }) {
  return (
    <View
      style={[
        sharedStyles.pageDivider,
        expandedSpacing && sharedStyles.expandedPageDivider,
      ]}
    />
  );
}
