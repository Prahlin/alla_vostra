import { Animated, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { useEffect, useRef } from "react";

import styles from "../styles/headerStyles";

export default function AppHeader({
  activePage = "home",
  scrollY,
  showCarousel = true,
  showHero = true,
  showOnlyCarousel = false,
  showOnlyHero = false,
}) {
  const leftArrowX = useRef(new Animated.Value(0)).current;
  const rightArrowX = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(0.15)).current;
  const arrowLoopRef = useRef(null);
  const wasAtTopRef = useRef(true);

  useEffect(() => {
    const startArrowLoop = () => {
      if (arrowLoopRef.current) {
        arrowLoopRef.current.stop();
      }

      leftArrowX.setValue(0);
      rightArrowX.setValue(0);
      arrowOpacity.setValue(0.15);

      arrowLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(leftArrowX, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(rightArrowX, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(arrowOpacity, {
              toValue: 0.15,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(arrowOpacity, {
            toValue: 0.45,
            duration: 490,
            useNativeDriver: true,
          }),
          Animated.timing(arrowOpacity, {
            toValue: 0.15,
            duration: 490,
            useNativeDriver: true,
          }),
          Animated.timing(arrowOpacity, {
            toValue: 0.45,
            duration: 490,
            useNativeDriver: true,
          }),
          Animated.timing(arrowOpacity, {
            toValue: 0.15,
            duration: 490,
            useNativeDriver: true,
          }),
          Animated.timing(arrowOpacity, {
            toValue: 0.45,
            duration: 490,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(arrowOpacity, {
              toValue: 0,
              duration: 665,
              useNativeDriver: true,
            }),
            Animated.timing(leftArrowX, {
              toValue: -120,
              duration: 665,
              useNativeDriver: true,
            }),
            Animated.timing(rightArrowX, {
              toValue: 120,
              duration: 665,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(500),
        ])
      );

      arrowLoopRef.current.start();
    };

    const stopArrowLoop = () => {
      if (arrowLoopRef.current) {
        arrowLoopRef.current.stop();
        arrowLoopRef.current = null;
      }

      leftArrowX.setValue(0);
      rightArrowX.setValue(0);
      arrowOpacity.setValue(0);
    };

    startArrowLoop();

    const listenerId = scrollY?.addListener(({ value }) => {
      const isAtTop = value <= 1;

      if (!isAtTop && wasAtTopRef.current) {
        wasAtTopRef.current = false;
        stopArrowLoop();
      }

      if (isAtTop && !wasAtTopRef.current) {
        wasAtTopRef.current = true;
        startArrowLoop();
      }
    });

    return () => {
      stopArrowLoop();

      if (listenerId && scrollY) {
        scrollY.removeListener(listenerId);
      }
    };
  }, [arrowOpacity, leftArrowX, rightArrowX, scrollY]);

  const activeLink = activePage === "shop" ? "Shop" : "Home";

  const arrowPlacementOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
        extrapolate: "clamp",
      })
    : 1;

  const visibleArrowOpacity = Animated.multiply(
    arrowOpacity,
    arrowPlacementOpacity
  );

  const heroScale = scrollY.interpolate({
    inputRange: [0, 500],
    outputRange: [1.5, 3.05],
    extrapolate: "clamp",
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 500],
    outputRange: [30, -56],
    extrapolate: "clamp",
  });

  const carousel = (
    <View style={styles.carouselNavBar}>
      <View style={styles.carouselInner}>
        <Animated.View
          style={[
            styles.arrowBox,
            {
              opacity: visibleArrowOpacity,
              transform: [{ translateX: leftArrowX }],
            },
          ]}
        >
          <View style={[styles.arrowChevron, styles.arrowChevronLeft]} />
        </Animated.View>

        <Text style={styles.carouselActiveText}>{activeLink}</Text>

        <Animated.View
          style={[
            styles.arrowBox,
            {
              opacity: visibleArrowOpacity,
              transform: [{ translateX: rightArrowX }],
            },
          ]}
        >
          <View style={[styles.arrowChevron, styles.arrowChevronRight]} />
        </Animated.View>
      </View>
    </View>
  );

  const hero = (
    <View style={styles.hero}>
      <Animated.Image
        source={require("../background3.png")}
        style={[
          styles.heroImage,
          {
            transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );

  if (showOnlyCarousel) return carousel;
  if (showOnlyHero) return hero;

  return (
    <View style={styles.header}>
      <View style={styles.orangeBar}>
        <Link href="/" asChild>
          <Pressable style={styles.logoPressable}>
            <Text style={styles.logoText}>Alla Vostra</Text>
          </Pressable>
        </Link>

        <View style={styles.shopButtonWrap}>
          <Link href="/shop" asChild>
            <Pressable style={styles.shopButton}>
              <Text style={styles.shopButtonText}>SHOP</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {showCarousel && carousel}
      {showHero && hero}
    </View>
  );
}