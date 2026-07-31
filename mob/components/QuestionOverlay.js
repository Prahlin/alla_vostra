import { Image, Text, View, useWindowDimensions } from "react-native";
import { usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ButtonShadowPlate from "./ButtonShadowPlate";
import Pressable from "./HapticPressable";
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
  { number: "5", label: "Your Delivery\nIs Coming!" },
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
const questionGuidePaymentCardVisualScale = 1.5;
const questionGuideBargainVisualScale = 1.5;
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
  buttonSize,
  buttonVisualScale = 1,
  gap,
}) {
  const buttonVisualOverflow = buttonSize * (buttonVisualScale - 1) * 0.5;

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={[
          shopStyles.paymentOverlayWalletMethodButton,
          {
            height: buttonSize,
            marginBottom: buttonVisualOverflow,
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
            marginTop: gap,
            width: badgeSize,
          },
        ]}
      >
        <QuestionGuideAcceptedCheckIcon size={badgeSize * 0.455} />
      </View>
    </View>
  );
}

export default function QuestionOverlay({ headerScrollY = null }) {
  const { closeQuestionOverlay, isQuestionOverlayVisible } = useShopCart();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
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
  const overlayCreamHeight = Math.max(
    0,
    overlayHeight - questionOverlayChromeBandHeight * 2,
  );
  const overlayGuideTop =
    questionOverlayChromeBandHeight +
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
  const guideChevronSideSlotWidth = Math.max(
    0,
    (overlayFrameWidth - guideImageSize) / 2,
  );
  const guideChevronSlotOffset =
    (guideChevronSideSlotWidth - guideChevronSlotSize) / 2;
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
  const guidePaymentButtonSize =
    guideAddButtonSize * questionGuideProductControlVisualScale;
  const guidePaymentBadgeSize = guidePaymentButtonSize * (39 / 55.5);
  const guidePaymentStackGap = guidePaymentButtonSize * (8 / 55.5);
  const guideBargainImageSize = guidePaymentButtonSize;
  const slideOneGuideEdgePadding = Math.max(
    0,
    overlayGuideTop - questionOverlayChromeBandHeight,
  );
  const slideOneGuideBottom = questionOverlayChromeBandHeight +
    slideOneGuideEdgePadding;
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
        guideImageSize) /
        2,
    ) * 0.75;
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
                      height: guideImageSize,
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
                              width: guideImageSize,
                              height: guideImageSize,
                              borderRadius: guideImageSize / 2,
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              source={piccolaProduct.image}
                              resizeMode="contain"
                              style={{
                                width: guideImageSize,
                                height: guideImageSize,
                                borderRadius: guideImageSize / 2,
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
                          buttonSize={guidePaymentButtonSize}
                          buttonVisualScale={questionGuidePaymentCardVisualScale}
                          gap={guidePaymentStackGap}
                        />
                      ) : showDeliveryGuidePreview ? (
                        <Image
                          resizeMode="contain"
                          source={require("../bargain_square_whitefill.png")}
                          style={{
                            height: guideBargainImageSize,
                            transform: [
                              { scale: questionGuideBargainVisualScale },
                            ],
                            width: guideBargainImageSize,
                          }}
                        />
                      ) : null}
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </View>

    </>
  );
}
