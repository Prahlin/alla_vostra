import { Text, View, useWindowDimensions } from "react-native";
import { usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Pressable from "./HapticPressable";
import stickyQuestionStyles from "../styles/stickyQuestionStyles";
import shopStyles from "../styles/shopStyles";
import { bodyFont, tightText } from "../styles/typography";
import {
  getHeaderTopBarHeight,
  getSmallAndroidHeaderTopOverlap,
  getTopSafeInset,
} from "../utils/platformLayout";
import { readAnimatedValue } from "../utils/headerNavigationGate";
import {
  mainHorizontalPadding,
  scaleLineHeight,
  scaleText,
  scaleVerticalGap,
} from "../utils/responsiveLayout";
import { useShopCart } from "../utils/shopCartContext";
import {
  stickyButtonEdgeOffset,
  stickyButtonSize,
} from "../utils/stickyButtonLayout";

const orangeButtonGradientColors = ["#FFC878", "#f7b967", "#D9953F"];
const topOverlayGradientColors = ["#F6C078", "#f7b967", "#E6A04D"];
const questionOverlaySteps = [
  { number: "1", label: "Browse Grazingboards" },
  { number: "2", label: "Pick Your Quantity" },
  { number: "3", label: "Add To Cart" },
  { number: "4", label: "Complete Your Checkout" },
  { number: "5", label: "Your Delivery Is Coming!" },
];
const questionBubbleScale = 0.5;
const questionBubbleSize = stickyButtonSize * questionBubbleScale;
const questionOverlaySwipeActivationDistance = 28;
const questionOverlaySwipeActivationRatio = 1.05;
const carouselBaseHeight = 84;
const stickyExpansionStartScroll = 96;
const stickyExpansionEndScroll = 120;
const stickyExpansionMaxHeight = 20;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function QuestionNumberIcon({ number }) {
  const gradientId = `questionOverlayNumberGradient${number}`;

  return (
    <Svg width={20} height={20} viewBox="0 0 40 40" fill="none">
      <Defs>
        <SvgLinearGradient
          id={gradientId}
          x1="20"
          y1="4"
          x2="20"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFC878" />
          <Stop offset="0.52" stopColor="#f7b967" />
          <Stop offset="1" stopColor="#D9953F" />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        fill={`url(#${gradientId})`}
        fontFamily="TT Fors Black"
        fontSize={38}
        fontWeight="900"
        stroke="#111111"
        strokeWidth={0.38}
        textAnchor="middle"
        x={20}
        y={34}
      >
        {number}
      </SvgText>
    </Svg>
  );
}

function QuestionNumberBubble({ number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "relative",
        width: questionBubbleSize,
        height: questionBubbleSize,
        borderRadius: questionBubbleSize / 2,
      }}
    >
      <View
        style={[
          stickyQuestionStyles.shadowPlate,
          {
            borderRadius: questionBubbleSize / 2,
          },
        ]}
      />
      <View
        style={[
          stickyQuestionStyles.button,
          {
            borderRadius: questionBubbleSize / 2,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            stickyQuestionStyles.buttonFillClip,
            {
              borderRadius: questionBubbleSize / 2,
            },
          ]}
        >
          <View style={stickyQuestionStyles.buttonFill} />
        </View>
        <View
          pointerEvents="none"
          style={stickyQuestionStyles.buttonForeground}
        >
          <QuestionNumberIcon number={number} />
        </View>
      </View>
    </View>
  );
}

export default function QuestionOverlay({ headerScrollY = null }) {
  const { closeQuestionOverlay, isQuestionOverlayVisible } = useShopCart();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const overlayTouchStartRef = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (isQuestionOverlayVisible) {
      setCurrentStepIndex(0);
    }
  }, [isQuestionOverlayVisible]);

  const handleOverlayResponderGrant = useCallback((event) => {
    overlayTouchStartRef.current = {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };
  }, []);

  const handleOverlayResponderRelease = useCallback((event) => {
    const touchStart = overlayTouchStartRef.current;
    const dx = event.nativeEvent.pageX - touchStart.x;
    const dy = event.nativeEvent.pageY - touchStart.y;
    const isLeftSwipe =
      dx <= -questionOverlaySwipeActivationDistance &&
      Math.abs(dx) > Math.abs(dy) * questionOverlaySwipeActivationRatio;

    if (!isLeftSwipe) return;

    setCurrentStepIndex((current) =>
      Math.min(current + 1, questionOverlaySteps.length - 1),
    );
  }, []);

  if (!isQuestionOverlayVisible) {
    return null;
  }

  const topSafeInset = getTopSafeInset(insets);
  const headerHeight = getHeaderTopBarHeight(insets);
  const smallAndroidHeaderTopOverlap = getSmallAndroidHeaderTopOverlap(insets);
  const hasCarouselHeader = pathname !== "/shop";
  const headerScrollValue = hasCarouselHeader
    ? readAnimatedValue(headerScrollY)
    : 0;
  const headerCollapseOffset = hasCarouselHeader
    ? clamp(headerScrollValue, 0, headerHeight)
    : 0;
  const stickyExpansionProgress = hasCarouselHeader
    ? clamp(
        (headerScrollValue - stickyExpansionStartScroll) /
          (stickyExpansionEndScroll - stickyExpansionStartScroll),
        0,
        1,
      )
    : 0;
  const visibleHeaderHeight =
    headerHeight -
    headerCollapseOffset +
    (hasCarouselHeader
      ? carouselBaseHeight +
        stickyExpansionProgress * stickyExpansionMaxHeight
      : 0);
  const visibleOrangeBarHeight = hasCarouselHeader
    ? Math.max(0, headerHeight - headerCollapseOffset)
    : headerHeight;
  const visibleCarouselHeight = hasCarouselHeader
    ? carouselBaseHeight + stickyExpansionProgress * stickyExpansionMaxHeight
    : 0;
  const overlayTopOffset = topSafeInset || smallAndroidHeaderTopOverlap
    ? visibleHeaderHeight - smallAndroidHeaderTopOverlap
    : visibleHeaderHeight;
  const carouselDimTop = topSafeInset || smallAndroidHeaderTopOverlap
    ? visibleOrangeBarHeight - smallAndroidHeaderTopOverlap
    : visibleOrangeBarHeight;
  const overlayVerticalGap = scaleVerticalGap(24);
  const overlayHorizontalMargin = mainHorizontalPadding * 0.5;
  const overlayCreamHorizontalPadding = overlayHorizontalMargin * 2;
  const stickyTopY =
    windowHeight -
    overlayTopOffset -
    insets.bottom -
    stickyButtonEdgeOffset -
    stickyButtonSize;
  const overlayTop = overlayVerticalGap;
  const overlayBottom = stickyTopY - overlayVerticalGap;
  const overlayHeight = Math.max(120, overlayBottom - overlayTop);
  const overlayCreamHeight = Math.max(0, overlayHeight - 56);
  const overlayGuideTop =
    28 +
    Math.max(
      0,
      (overlayCreamHeight -
        questionOverlaySteps.length * questionBubbleSize) /
        (questionOverlaySteps.length + 1),
    );
  const overlayTopOffsetStyle = {
    top: overlayTopOffset,
  };
  const currentStep = questionOverlaySteps[currentStepIndex];

  return (
    <>
      {hasCarouselHeader && visibleCarouselHeight > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: carouselDimTop,
            right: 0,
            left: 0,
            height: visibleCarouselHeight,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000001,
            elevation: 1000001,
          }}
        />
      ) : null}

      <View
        pointerEvents="none"
        style={[shopStyles.shopScreenDimLayer, overlayTopOffsetStyle]}
      />

      <View
        style={[shopStyles.truckOverlayTouchFrame, overlayTopOffsetStyle]}
      >
        <Pressable
          accessibilityLabel="Close questions overlay"
          accessibilityRole="button"
          onPress={closeQuestionOverlay}
          style={shopStyles.truckOverlayDismissLayer}
        />
        <View
          pointerEvents="box-none"
          style={[
            shopStyles.truckOverlayFrame,
            {
              top: overlayTop,
              left: overlayHorizontalMargin,
              right: overlayHorizontalMargin,
              height: overlayHeight,
            },
          ]}
        >
          <View
            style={[
              shopStyles.truckOverlayWindowShadowFrame,
              shopStyles.truckOverlayWindowFull,
            ]}
          >
            <View
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleOverlayResponderGrant}
              onResponderRelease={handleOverlayResponderRelease}
              style={[
                shopStyles.truckOverlayWindow,
                shopStyles.truckOverlayWindowFull,
                {
                  paddingHorizontal: overlayCreamHorizontalPadding,
                  paddingVertical: overlayVerticalGap,
                  justifyContent: "flex-start",
                },
              ]}
            >
              <LinearGradient
                colors={topOverlayGradientColors}
                locations={[0, 0.52, 1]}
                pointerEvents="none"
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                style={[
                  shopStyles.piccolaOverlayTopFill,
                  shopStyles.cartOverlayTopFill,
                ]}
              />
              <LinearGradient
                colors={orangeButtonGradientColors}
                locations={[0, 0.52, 1]}
                pointerEvents="none"
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={shopStyles.piccolaOverlayBottomFill}
              />
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: overlayGuideTop,
                  left: overlayCreamHorizontalPadding,
                  right: overlayCreamHorizontalPadding,
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  zIndex: 1,
                  elevation: 1,
                }}
              >
                <QuestionNumberBubble number={currentStep.number} />
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  numberOfLines={2}
                  style={{
                    ...tightText,
                    flex: 1,
                    marginLeft: scaleText(12),
                    fontFamily: bodyFont,
                    fontSize: scaleText(20),
                    lineHeight: scaleLineHeight(24),
                    color: "#111111",
                    textAlign: "center",
                  }}
                >
                  {currentStep.label}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

    </>
  );
}
