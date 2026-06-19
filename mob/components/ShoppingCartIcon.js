import Svg, { Circle, Path } from "react-native-svg";

export default function ShoppingCartIcon() {
  return (
    <Svg width={31.9} height={31.9} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.25 5.25H6.5L8.35 15.1H17.2L19.45 8.3H7.15"
        stroke="#FFFFFF"
        strokeWidth={2.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.15 18.35H17.35"
        stroke="#FFFFFF"
        strokeWidth={2.15}
        strokeLinecap="round"
      />
      <Circle cx={9.85} cy={20.1} r={1.05} fill="#FFFFFF" />
      <Circle cx={16.75} cy={20.1} r={1.05} fill="#FFFFFF" />
    </Svg>
  );
}
