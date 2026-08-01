import { Image, Platform, Text, View, useWindowDimensions } from "react-native";
import { usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ButtonShadowPlate from "./ButtonShadowPlate";
import Pressable from "./HapticPressable";
import SwipeLeftAnimatic from "./SwipeLeftAnimatic";
import { piccolaProduct } from "../data/shopOverlayProducts";
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
  scaleLayout,
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
  { number: "1", label: "Browse\nGrazingboards" },
  { number: "2", label: "Pick Your\nQuantity" },
  { number: "3", label: "Add To\nCart" },
  { number: "4", label: "Complete Your\nCheckout" },
  { number: "5", label: "Delivery\nOn Its Way!" },
];
const questionBubbleScale = 1;
const questionBubbleSize = stickyButtonSize * questionBubbleScale;
const questionNumberIconSize = 20 * (questionBubbleScale / 0.5);
const questionOverlaySwipeActivationDistance = 28;
const questionOverlaySwipeActivationRatio = 1.05;
const questionOverlayChromeBandHeight = 28;
const questionOverlayImageRowAssetScale = 1.5625;
const questionGuideProductControlScale = 1.28;
const questionGuideProductControlVisualScale = 1.5;
const questionGuideCheckoutAssetVisualScale = 1.5;
const questionGuidePaymentCardVisualScale =
  questionGuideProductControlVisualScale * questionGuideCheckoutAssetVisualScale;
const questionGuideBargainVisualScale =
  questionGuideProductControlVisualScale * questionGuideCheckoutAssetVisualScale;
const questionOverlayBottomNavButtonHeight = scaleLayout(55.5);
const questionOverlayBottomNavButtonTextLineHeight = Platform.select({
  ios: 26.5625 * 0.77,
  default: 24.5625,
});
const questionOverlayBottomNavButtonHorizontalInset =
  (questionOverlayBottomNavButtonHeight -
    questionOverlayBottomNavButtonTextLineHeight) /
  2;
const questionOverlayBottomNavButtonWidth =
  scaleLayout(94) + questionOverlayBottomNavButtonHorizontalInset * 2;
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
    <Svg
      width={questionNumberIconSize}
      height={questionNumberIconSize}
      viewBox="0 0 40 40"
      fill="none"
    >
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

function QuestionOverlayChevron({ direction }) {
  return (
    <View
      style={[
        shopStyles.overlayImageArrowBox,
        { transform: [{ scale: questionOverlayImageRowAssetScale }] },
      ]}
    >
      <View
        style={[
          shopStyles.overlayImageArrowChevron,
          direction === "left"
            ? shopStyles.overlayImageArrowChevronLeft
            : shopStyles.overlayImageArrowChevronRight,
        ]}
      />
    </View>
  );
}

function QuestionGuideQuantityTriangle({ direction, muted = true, size }) {
  const baseWidth = 43.70625;
  const baseHeight = 28.17;
  const strokeWidth = 2;
  const strokeInset = strokeWidth / 2;
  const isUpTriangle = direction === "up";
  const gradientId = isUpTriangle
    ? "questionGuideQuantityTriangleTopGradient"
    : "questionGuideQuantityTriangleBottomGradient";
  const fillGradientColors = isUpTriangle
    ? topOverlayGradientColors
    : orangeButtonGradientColors;
  const path = isUpTriangle
    ? [
        `M ${baseWidth / 2} ${strokeInset}`,
        `L ${baseWidth - strokeInset} ${baseHeight - strokeInset}`,
        `L ${strokeInset} ${baseHeight - strokeInset}`,
        "Z",
      ].join(" ")
    : [
        `M ${strokeInset} ${strokeInset}`,
        `L ${baseWidth - strokeInset} ${strokeInset}`,
        `L ${baseWidth / 2} ${baseHeight - strokeInset}`,
        "Z",
      ].join(" ");

  return (
    <Svg
      height={size.height}
      viewBox={`0 0 ${baseWidth} ${baseHeight}`}
      width={size.width}
    >
      <Defs>
        <SvgLinearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1={baseWidth / 2}
          x2={baseWidth / 2}
          y1={isUpTriangle ? baseHeight : 0}
          y2={isUpTriangle ? 0 : baseHeight}
        >
          {fillGradientColors.map((color, index) => (
            <Stop
              key={`${gradientId}-${color}`}
              offset={`${index * 50}%`}
              stopColor={color}
            />
          ))}
        </SvgLinearGradient>
      </Defs>
      <Path
        d={path}
        fill={`url(#${gradientId})`}
        opacity={muted ? 0.5 : 1}
        stroke={muted ? "#888888" : "#111111"}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

function QuestionGuideQuantityControls({
  addButtonSize,
  addButtonLowVisibility = false,
  counterHighVisibility = false,
  counterBoxHeight,
  counterBoxWidth,
  counterTriangleHeight,
  counterTriangleWidth,
  gap,
  quantity = "0",
}) {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          height: addButtonSize,
          position: "relative",
          width: addButtonSize,
        }}
      >
        <ButtonShadowPlate
          style={[
            shopStyles.piccolaOverlayBuyButtonShadowPlate,
            addButtonLowVisibility &&
              shopStyles.piccolaOverlayBuyButtonShadowPlateTapped,
            {
              borderRadius: addButtonSize * (10.5 / 55.5),
            },
          ]}
        />
        <View
          style={[
            shopStyles.piccolaOverlayBuyButton,
            addButtonLowVisibility && shopStyles.piccolaOverlayBuyButtonTapped,
            {
              borderRadius: addButtonSize * (10.5 / 55.5),
              height: addButtonSize,
              width: addButtonSize,
            },
          ]}
        >
          {!addButtonLowVisibility ? (
            <LinearGradient
              colors={["#2F9348", "#247C3A", "#1D6630"]}
              locations={[0, 0.52, 1]}
              pointerEvents="none"
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            />
          ) : null}
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={[
              shopStyles.piccolaOverlayBuyButtonText,
              addButtonLowVisibility &&
                shopStyles.piccolaOverlayBuyButtonTextTapped,
              {
                fontSize: addButtonSize * (15.84 / 55.5),
                lineHeight: addButtonSize * (19.8 / 55.5),
              },
            ]}
          >
            ADD
          </Text>
        </View>
      </View>
      <View
        style={{
          alignItems: "center",
          height: counterTriangleHeight * 2 + counterBoxHeight,
          justifyContent: "center",
          marginLeft: gap,
          overflow: "visible",
          width: counterTriangleWidth,
        }}
      >
        <QuestionGuideQuantityTriangle
          direction="up"
          muted={!counterHighVisibility}
          size={{
            height: counterTriangleHeight,
            width: counterTriangleWidth,
          }}
        />
        <View
          style={[
            shopStyles.piccolaOverlayBuyButton,
            counterHighVisibility
              ? shopStyles.piccolaOverlayBuyButtonAdded
              : shopStyles.piccolaOverlayQuantityZeroBox,
            shopStyles.piccolaOverlayQuantityBox,
            {
              height: counterBoxHeight,
              width: counterBoxWidth,
            },
          ]}
        >
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={[
              shopStyles.piccolaOverlayBuyButtonText,
              counterHighVisibility
                ? shopStyles.piccolaOverlayBuyButtonTextAdded
                : shopStyles.piccolaOverlayQuantityZeroText,
              shopStyles.piccolaOverlayQuantityNumber,
              {
                fontSize: addButtonSize * (15.84 / 55.5),
                lineHeight: addButtonSize * (19.8 / 55.5),
              },
            ]}
          >
            {quantity}
          </Text>
        </View>
        <QuestionGuideQuantityTriangle
          direction="down"
          muted={!counterHighVisibility}
          size={{
            height: counterTriangleHeight,
            width: counterTriangleWidth,
          }}
        />
      </View>
    </View>
  );
}

function QuestionGuidePaymentCardMethodIcon({ height, width }) {
  return (
    <Svg height={height} viewBox="0 0 64 42" width={width}>
      <Rect
        fill="none"
        height={34}
        rx={5}
        stroke="#111111"
        strokeWidth={2.4}
        width={56}
        x={4}
        y={4}
      />
      <Rect fill="#111111" height={6} width={56} x={4} y={12} />
      <Rect
        fill="none"
        height={8}
        rx={1.8}
        stroke="#111111"
        strokeWidth={2}
        width={11}
        x={11}
        y={23}
      />
      <Path
        d="M29 25h21M29 31h13"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeWidth={2.2}
      />
    </Svg>
  );
}

function QuestionGuideAcceptedCheckIcon({ size }) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M20 6 9 17l-5-5"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.2}
      />
    </Svg>
  );
}

function QuestionGuidePaymentAssets({
  badgeSize,
  badgeVisualScale = 1,
  buttonSize,
  buttonVisualScale = 1,
  gap,
}) {
  const badgeVisualOverflow = badgeSize * (badgeVisualScale - 1) * 0.5;
  const buttonVisualOverflow = buttonSize * (buttonVisualScale - 1) * 0.5;

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <View
        style={[
          shopStyles.paymentOverlayWalletMethodButton,
          {
            height: buttonSize,
            marginRight: gap + buttonVisualOverflow + badgeVisualOverflow,
            transform: [{ scale: buttonVisualScale }],
            width: buttonSize,
          },
        ]}
      >
        <QuestionGuidePaymentCardMethodIcon
          height={buttonSize * 0.54}
          width={buttonSize * 0.78}
        />
      </View>
      <View
        style={[
          shopStyles.paymentOverlayCardAcceptedBadge,
          {
            borderRadius: badgeSize * (6 / 39),
            height: badgeSize,
            transform: [{ scale: badgeVisualScale }],
            width: badgeSize,
          },
        ]}
      >
        <QuestionGuideAcceptedCheckIcon size={badgeSize * 0.455} />
      </View>
    </View>
  );
}

function QuestionGuideGotItIcon({ size }) {
  const faceGradientId = "questionGuideGotItFaceGradient";
  const handGradientId = "questionGuideGotItHandGradient";

  return (
    <Svg height={size} viewBox="0 0 96 96" width={size}>
      <Defs>
        <SvgLinearGradient
          gradientUnits="userSpaceOnUse"
          id={faceGradientId}
          x1={40.4}
          x2={40.4}
          y1={19}
          y2={67.8}
        >
          <Stop offset="0" stopColor="#FFF3A8" />
          <Stop offset="0.52" stopColor="#FFD86A" />
          <Stop offset="1" stopColor="#F7B967" />
        </SvgLinearGradient>
        <SvgLinearGradient
          gradientUnits="userSpaceOnUse"
          id={handGradientId}
          x1={61.5}
          x2={61.5}
          y1={37}
          y2={80}
        >
          <Stop offset="0" stopColor="#73D88A" />
          <Stop offset="0.52" stopColor="#49B96A" />
          <Stop offset="1" stopColor="#2F9348" />
        </SvgLinearGradient>
      </Defs>
      <Ellipse cx={52} cy={86} fill="#000000" opacity={0.16} rx={30} ry={5} />
      <G transform="rotate(-8 42 44)">
        <Circle
          cx={40.4}
          cy={43.4}
          r={24.4}
          fill={`url(#${faceGradientId})`}
          stroke="#111111"
          strokeWidth={4.2}
        />
        <Path
          d="M31 39C33.1 37.1 36.1 37.2 38 39.2"
          fill="none"
          stroke="#111111"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3.25}
        />
        <Path
          d="M45 39C47.1 37.1 50.1 37.2 52 39.2"
          fill="none"
          stroke="#111111"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3.25}
        />
        <Path
          d="M30.5 51C36.8 58.2 49.2 58.2 55.5 51"
          fill="none"
          stroke="#111111"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3.25}
        />
      </G>
      <G transform="translate(7 4) rotate(-6 67 58)">
        <Path
          d="M55 51L64.8 38.4C67.8 34.6 73.9 37.3 72.8 42L70.9 50.2H79.8C84.4 50.2 87.4 55.1 85.2 59.2L78.9 70.9C77.1 74.2 73.6 76.2 69.9 76.2H57.4C54.4 76.2 52 73.8 52 70.8V59.7C52 56.5 53.1 53.5 55 51Z"
          fill={`url(#${handGradientId})`}
          stroke="#111111"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4.2}
        />
        <Path
          d="M42.8 56.2H52.8V76.2H42.8C39.7 76.2 37.2 73.7 37.2 70.6V61.8C37.2 58.7 39.7 56.2 42.8 56.2Z"
          fill={`url(#${handGradientId})`}
          stroke="#111111"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4.2}
        />
        <Path
          d="M70 55.6H82M68.5 61.7H79.2M66.3 67.8H75.4"
          fill="none"
          stroke="#111111"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.45}
        />
        <Path
          d="M61.8 49.6C64 52.8 67.6 53.5 70.9 50.2"
          fill="none"
          stroke="#111111"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.45}
        />
      </G>
    </Svg>
  );
}

export default function QuestionOverlay({
  headerScrollY = null,
  onClose = null,
  presentation = "shop",
  visible = null,
}) {
  const { closeQuestionOverlay, isQuestionOverlayVisible } = useShopCart();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const isSplashPresentation = presentation === "splash";
  const overlayVisible =
    typeof visible === "boolean" ? visible : isQuestionOverlayVisible;
  const closeOverlay = onClose || closeQuestionOverlay;
  const overlayTouchStartRef = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (overlayVisible) {
      setCurrentStepIndex(0);
    }
  }, [overlayVisible]);

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
    const isRightSwipe =
      dx >= questionOverlaySwipeActivationDistance &&
      Math.abs(dx) > Math.abs(dy) * questionOverlaySwipeActivationRatio;

    if (!isLeftSwipe && !isRightSwipe) return;

    if (isLeftSwipe) {
      setCurrentStepIndex((current) =>
        Math.min(current + 1, questionOverlaySteps.length - 1),
      );
      return;
    }

    setCurrentStepIndex((current) => {
      if (current === 0) {
        if (!isSplashPresentation) {
          closeOverlay();
        }

        return current;
      }

      return current - 1;
    });
  }, [closeOverlay, isSplashPresentation]);

  if (!overlayVisible) {
    return null;
  }

  const topSafeInset = getTopSafeInset(insets);
  const headerHeight = getHeaderTopBarHeight(insets);
  const smallAndroidHeaderTopOverlap = getSmallAndroidHeaderTopOverlap(insets);
  const hasCarouselHeader = !isSplashPresentation && pathname !== "/shop";
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
  const defaultOverlayTopOffset = topSafeInset || smallAndroidHeaderTopOverlap
    ? visibleHeaderHeight - smallAndroidHeaderTopOverlap
    : visibleHeaderHeight;
  const overlayTopOffset = isSplashPresentation ? 0 : defaultOverlayTopOffset;
  const carouselDimTop = topSafeInset || smallAndroidHeaderTopOverlap
    ? visibleOrangeBarHeight - smallAndroidHeaderTopOverlap
    : visibleOrangeBarHeight;
  const overlayVerticalGap = scaleVerticalGap(24);
  const overlayHorizontalMargin = mainHorizontalPadding * 0.5;
  const overlayCreamHorizontalPadding = overlayHorizontalMargin * 2;
  const stickyTopY =
    windowHeight -
    defaultOverlayTopOffset -
    insets.bottom -
    stickyButtonEdgeOffset -
    stickyButtonSize;
  const splashUsableTop = topSafeInset;
  const splashUsableHeight = Math.max(
    0,
    windowHeight - splashUsableTop - insets.bottom,
  );
  const splashReferenceOverlayHeight = Math.max(
    120,
    windowHeight -
      headerHeight -
      insets.bottom -
      stickyButtonEdgeOffset -
      stickyButtonSize -
      overlayVerticalGap * 2,
  );
  const splashOverlayHeight = Math.min(
    splashReferenceOverlayHeight,
    Math.max(120, splashUsableHeight - overlayVerticalGap * 2),
  );
  const overlayTop = isSplashPresentation
    ? splashUsableTop +
      Math.max(overlayVerticalGap, (splashUsableHeight - splashOverlayHeight) / 2)
    : overlayVerticalGap;
  const overlayBottom = stickyTopY - overlayVerticalGap;
  const overlayHeight = isSplashPresentation
    ? splashOverlayHeight
    : Math.max(120, overlayBottom - overlayTop);
  const activeOverlayChromeBandHeight = isSplashPresentation
    ? 0
    : questionOverlayChromeBandHeight;
  const overlayCreamHeight = Math.max(
    0,
    overlayHeight - activeOverlayChromeBandHeight * 2,
  );
  const overlayGuideTop =
    activeOverlayChromeBandHeight +
    Math.max(
      0,
      (overlayCreamHeight -
        questionOverlaySteps.length * questionBubbleSize) /
        (questionOverlaySteps.length + 1),
    );
  const guideImageSize =
    clamp(overlayCreamHeight * 0.28, 132, 190) *
    questionOverlayImageRowAssetScale;
  const guideChevronSlotSize = stickyButtonSize;
  const overlayFrameWidth = Math.max(
    0,
    windowWidth - overlayHorizontalMargin * 2,
  );
  const overlayTopOffsetStyle = {
    top: overlayTopOffset,
  };
  const currentStep = questionOverlaySteps[currentStepIndex];
  const showPiccolaProductPreview = currentStepIndex === 0;
  const showQuantityGuidePreview = currentStepIndex === 1;
  const showProductControlGuidePreview =
    showQuantityGuidePreview || currentStepIndex === 2;
  const showPaymentGuidePreview = currentStepIndex === 3;
  const showDeliveryGuidePreview = currentStepIndex === 4;
  const showTextOnlyGuidePreview =
    showPaymentGuidePreview || showDeliveryGuidePreview;
  const useStackGuideLayout =
    showPiccolaProductPreview ||
    showProductControlGuidePreview ||
    showTextOnlyGuidePreview;
  const useProminentGuideLabel = useStackGuideLayout;
  const showSwipeAnimaticGuide = currentStepIndex <= 3;
  const showGotItGuideButton = currentStepIndex === 4;
  const swipeAnimaticWidth = clamp(overlayFrameWidth * 0.36, 112, 136);
  const swipeAnimaticHeight = Math.round(swipeAnimaticWidth * (76 / 180));
  const swipeAnimaticGap = scaleVerticalGap(6);
  const bottomGuideControlReservedHeight =
    showSwipeAnimaticGuide || showGotItGuideButton
      ? swipeAnimaticHeight + swipeAnimaticGap
      : 0;
  const guideStackReferenceImageSize = Math.min(
    guideImageSize,
    clamp(overlayCreamHeight * 0.42, 150, 236),
  );
  const activeGuideImageSize = showPiccolaProductPreview
    ? guideStackReferenceImageSize
    : guideImageSize;
  const guideVisualSlotSize = guideStackReferenceImageSize;
  const guideChevronSideSlotWidth = Math.max(
    0,
    (overlayFrameWidth - activeGuideImageSize) / 2,
  );
  const guideChevronSlotOffset =
    (guideChevronSideSlotWidth - guideChevronSlotSize) / 2;
  const guideLabelFontSize = useProminentGuideLabel ? 30 : 20;
  const guideLabelLineHeight = useProminentGuideLabel ? 36 : 24;
  const guideLabelTextHeight = scaleLineHeight(guideLabelLineHeight) * 2;
  const guideAddButtonSize =
    stickyButtonSize * questionGuideProductControlScale;
  const guideCounterBoxWidth = guideAddButtonSize * (29.1375 / 55.5);
  const guideCounterBoxHeight = guideAddButtonSize * (41.625 / 55.5);
  const guideCounterTriangleWidth = guideCounterBoxWidth;
  const guideCounterTriangleHeight = guideAddButtonSize * (18.78 / 55.5);
  const guideControlGap = scaleText(18);
  const guidePaymentButtonSize = guideAddButtonSize;
  const guidePaymentBadgeSize = guidePaymentButtonSize * (39 / 55.5);
  const guidePaymentStackGap = guidePaymentButtonSize * (8 / 55.5);
  const guideBargainImageSize = guidePaymentButtonSize;
  const guideDeliveryIconSize =
    guideBargainImageSize * questionGuideBargainVisualScale * 1.32;
  const guideDeliveryIconLift = scaleVerticalGap(24);
  const guideProductControlVisualHeight =
    Math.max(
      guideAddButtonSize,
      guideCounterTriangleHeight * 2 + guideCounterBoxHeight,
    ) * questionGuideProductControlVisualScale;
  const guidePaymentVisualHeight =
    Math.max(
      guidePaymentButtonSize * questionGuidePaymentCardVisualScale,
      guidePaymentBadgeSize * questionGuideCheckoutAssetVisualScale,
    );
  const guideDeliveryVisualHeight = guideDeliveryIconSize;
  const slideOneGuideEdgePadding = Math.max(
    0,
    overlayGuideTop - activeOverlayChromeBandHeight,
  );
  const slideOneGuideBottom =
    activeOverlayChromeBandHeight +
    slideOneGuideEdgePadding +
    bottomGuideControlReservedHeight;
  const slideOneGuideFrameHeight = Math.max(
    0,
    overlayHeight - overlayGuideTop - slideOneGuideBottom,
  );
  const slideOneGuideStackGap =
    Math.max(
      0,
      (slideOneGuideFrameHeight -
        questionBubbleSize -
        guideLabelTextHeight -
        guideStackReferenceImageSize) /
        2,
    ) * 0.75;
  const guideVisualFrameTop =
    overlayGuideTop +
    questionBubbleSize +
    slideOneGuideStackGap +
    guideLabelTextHeight +
    slideOneGuideStackGap;
  const guideVisualHeight = showProductControlGuidePreview
    ? guideProductControlVisualHeight
    : showPaymentGuidePreview
      ? guidePaymentVisualHeight
      : showDeliveryGuidePreview
        ? guideDeliveryVisualHeight
        : activeGuideImageSize;
  const guideVisualBottom =
    guideVisualFrameTop + (guideVisualSlotSize + guideVisualHeight) / 2;
  const bottomOrangeBannerTop = overlayHeight - activeOverlayChromeBandHeight;
  const swipeAnimaticSlotTop =
    showSwipeAnimaticGuide || showGotItGuideButton
    ? guideVisualBottom +
      Math.max(
        0,
        bottomOrangeBannerTop - guideVisualBottom - swipeAnimaticHeight,
      ) /
        2
    : 0;
  const gotItButtonLeft =
    (overlayFrameWidth - questionOverlayBottomNavButtonWidth) / 2;
  const slideOneGuideFrameStyle = useStackGuideLayout
    ? {
        bottom: slideOneGuideBottom,
        justifyContent: "flex-start",
      }
    : null;

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

      {!isSplashPresentation ? (
        <View
          pointerEvents="none"
          style={[shopStyles.shopScreenDimLayer, overlayTopOffsetStyle]}
        />
      ) : null}

      <View
        style={[shopStyles.truckOverlayTouchFrame, overlayTopOffsetStyle]}
      >
        {!isSplashPresentation ? (
          <Pressable
            accessibilityLabel="Close questions overlay"
            accessibilityRole="button"
            onPress={closeOverlay}
            style={shopStyles.truckOverlayDismissLayer}
          />
        ) : null}
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
              {!isSplashPresentation ? (
                <>
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
                </>
              ) : null}
              <View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: overlayGuideTop,
                    left: overlayCreamHorizontalPadding,
                    right: overlayCreamHorizontalPadding,
                    zIndex: 1,
                    elevation: 1,
                  },
                  slideOneGuideFrameStyle,
                ]}
              >
                {useStackGuideLayout ? (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <QuestionNumberBubble number={currentStep.number} />
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      alignSelf: "flex-start",
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
                        fontSize: scaleText(guideLabelFontSize),
                        lineHeight: scaleLineHeight(guideLabelLineHeight),
                        color: "#111111",
                        textAlign: "center",
                      }}
                    >
                      {currentStep.label}
                    </Text>
                  </View>
                )}
                {useStackGuideLayout ? (
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                    numberOfLines={2}
                    style={{
                      ...tightText,
                      width: "100%",
                      marginTop: slideOneGuideStackGap,
                      fontFamily: bodyFont,
                      fontSize: scaleText(guideLabelFontSize),
                      lineHeight: scaleLineHeight(guideLabelLineHeight),
                      color: "#111111",
                      textAlign: "center",
                    }}
                  >
                    {currentStep.label}
                  </Text>
                ) : null}
                {useStackGuideLayout ? (
                  <View
                    style={{
                      width: "100%",
                      height: guideVisualSlotSize,
                      marginTop: slideOneGuideStackGap,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {showPiccolaProductPreview ? (
                        <>
                          <View
                            style={{
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              left: guideChevronSlotOffset,
                              width: guideChevronSlotSize,
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                              elevation: 1,
                            }}
                          >
                            <QuestionOverlayChevron direction="left" />
                          </View>
                          <View
                            style={{
                              width: activeGuideImageSize,
                              height: activeGuideImageSize,
                              borderRadius: activeGuideImageSize / 2,
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              source={piccolaProduct.image}
                              resizeMode="contain"
                              style={{
                                width: activeGuideImageSize,
                                height: activeGuideImageSize,
                                borderRadius: activeGuideImageSize / 2,
                              }}
                            />
                          </View>
                          <View
                            style={{
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              right: guideChevronSlotOffset,
                              width: guideChevronSlotSize,
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                              elevation: 1,
                            }}
                          >
                            <QuestionOverlayChevron direction="right" />
                          </View>
                        </>
                      ) : showProductControlGuidePreview ? (
                        <View
                          style={{
                            transform: [
                              {
                                scale: questionGuideProductControlVisualScale,
                              },
                            ],
                          }}
                        >
                          <QuestionGuideQuantityControls
                            addButtonSize={guideAddButtonSize}
                            addButtonLowVisibility={showQuantityGuidePreview}
                            counterHighVisibility={showQuantityGuidePreview}
                            counterBoxHeight={guideCounterBoxHeight}
                            counterBoxWidth={guideCounterBoxWidth}
                            counterTriangleHeight={guideCounterTriangleHeight}
                            counterTriangleWidth={guideCounterTriangleWidth}
                            gap={guideControlGap}
                            quantity={showQuantityGuidePreview ? "1" : "0"}
                          />
                        </View>
                      ) : showPaymentGuidePreview ? (
                        <QuestionGuidePaymentAssets
                          badgeSize={guidePaymentBadgeSize}
                          badgeVisualScale={questionGuideCheckoutAssetVisualScale}
                          buttonSize={guidePaymentButtonSize}
                          buttonVisualScale={questionGuidePaymentCardVisualScale}
                          gap={guidePaymentStackGap}
                        />
                      ) : showDeliveryGuidePreview ? (
                        <View
                          style={{
                            transform: [{ translateY: -guideDeliveryIconLift }],
                          }}
                        >
                          <QuestionGuideGotItIcon size={guideDeliveryIconSize} />
                        </View>
                      ) : null}
                    </View>
                  </View>
                ) : null}
              </View>
              {showSwipeAnimaticGuide ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    right: overlayCreamHorizontalPadding,
                    left: overlayCreamHorizontalPadding,
                    top: swipeAnimaticSlotTop,
                    height: swipeAnimaticHeight,
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    elevation: 2,
                  }}
                >
                  <SwipeLeftAnimatic width={swipeAnimaticWidth} />
                </View>
              ) : null}
              {showGotItGuideButton ? (
                <Pressable
                  accessibilityLabel="Close questions overlay"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={closeOverlay}
                  style={{
                    position: "absolute",
                    left: gotItButtonLeft,
                    top: swipeAnimaticSlotTop,
                    width: questionOverlayBottomNavButtonWidth,
                    height: questionOverlayBottomNavButtonHeight,
                    zIndex: 2,
                    elevation: 2,
                  }}
                >
                  <View
                    style={[
                      shopStyles.shippingPreviewReadyButtonShadowFrame,
                      {
                        width: questionOverlayBottomNavButtonWidth,
                        height: questionOverlayBottomNavButtonHeight,
                      },
                    ]}
                  >
                    <ButtonShadowPlate
                      style={shopStyles.shippingPreviewReadyButtonShadowPlate}
                    />
                    <View
                      style={[
                        shopStyles.shippingPill,
                        shopStyles.shippingPillOverlay,
                        shopStyles.shippingPreviewReadyButton,
                        {
                          paddingHorizontal:
                            questionOverlayBottomNavButtonHorizontalInset,
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={orangeButtonGradientColors}
                        locations={[0, 0.52, 1]}
                        pointerEvents="none"
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={shopStyles.confirmationOverlayButtonGradient}
                      />
                      <View style={shopStyles.shippingPreviewActionButtonContent}>
                        <Text
                          adjustsFontSizeToFit
                          allowFontScaling={false}
                          minimumFontScale={0.68}
                          numberOfLines={1}
                          style={[
                            shopStyles.shippingPillText,
                            shopStyles.shippingPillTextOverlay,
                            shopStyles.shippingPreviewReadyButtonText,
                            shopStyles.shippingPreviewReadyButtonTextPrimary,
                          ]}
                        >
                          Got It!
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </View>

    </>
  );
}
