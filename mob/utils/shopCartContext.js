import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createInitialShopProductState,
  getCartPriceValue,
  shopProducts,
} from "../data/shopOverlayProducts";

const ShopCartContext = createContext(null);

export function ShopCartProvider({ children }) {
  const [overlayProductQuantities, setOverlayProductQuantities] = useState(() =>
    createInitialShopProductState(0)
  );
  const [
    overlayProductConfirmations,
    setOverlayProductConfirmations,
  ] = useState(() => createInitialShopProductState(false));
  const [overlayCartProductNames, setOverlayCartProductNames] = useState([]);
  const [
    overlayCartBillableProductNames,
    setOverlayCartBillableProductNames,
  ] = useState([]);
  const previousOverlayProductQuantitiesRef = useRef(
    overlayProductQuantities
  );
  const [cartOverlayActionRequest, setCartOverlayActionRequest] = useState({
    action: null,
    id: 0,
    pending: false,
  });
  const [isShopOverlayVisible, setIsShopOverlayVisible] = useState(false);
  const [
    isOrderConfirmationOverlayVisible,
    setIsOrderConfirmationOverlayVisible,
  ] = useState(false);

  const updateOverlayProductQuantity = useCallback((productKey, updater) => {
    setOverlayProductQuantities((current) => {
      const currentQuantity = current[productKey] || 0;
      const nextQuantity = updater(currentQuantity);

      if (nextQuantity === currentQuantity) return current;

      return {
        ...current,
        [productKey]: nextQuantity,
      };
    });
  }, []);

  const updateOverlayProductConfirmation = useCallback(
    (productKey, updater) => {
      const currentConfirmation = Boolean(
        overlayProductConfirmations[productKey]
      );
      const nextConfirmation =
        typeof updater === "function" ? updater(currentConfirmation) : updater;

      setOverlayProductConfirmations((current) => {
        const currentInState = Boolean(current[productKey]);

        if (nextConfirmation === currentInState) return current;

        return {
          ...current,
          [productKey]: nextConfirmation,
        };
      });

      setOverlayCartProductNames((current) => {
        const isInCart = current.includes(productKey);

        if (nextConfirmation) {
          return isInCart ? current : [...current, productKey];
        }

        return isInCart
          ? current.filter((productName) => productName !== productKey)
          : current;
      });

      setOverlayCartBillableProductNames((current) => {
        const currentQuantity = overlayProductQuantities[productKey] || 0;

        if (nextConfirmation && currentQuantity > 0) {
          return current.includes(productKey)
            ? current
            : [...current, productKey];
        }

        if (!nextConfirmation && current.includes(productKey)) {
          return current.filter((productName) => productName !== productKey);
        }

        return current;
      });
    },
    [overlayProductConfirmations, overlayProductQuantities]
  );

  const discardUnconfirmedOverlayProductDraft = useCallback(
    (productName) => {
      if (overlayProductConfirmations[productName]) return;

      setOverlayProductQuantities((current) => {
        if ((current[productName] || 0) === 0) return current;

        return {
          ...current,
          [productName]: 0,
        };
      });
    },
    [overlayProductConfirmations]
  );

  const pruneZeroQuantityCartEntries = useCallback(() => {
    setOverlayCartProductNames((current) => {
      const next = current.filter(
        (productName) => (overlayProductQuantities[productName] || 0) > 0
      );

      return next.length === current.length ? current : next;
    });

    setOverlayCartBillableProductNames((current) => {
      const next = current.filter(
        (productName) => (overlayProductQuantities[productName] || 0) > 0
      );

      return next.length === current.length ? current : next;
    });
  }, [overlayProductQuantities]);

  const requestCartOverlayOpen = useCallback(() => {
    setCartOverlayActionRequest((current) => ({
      action: "open",
      id: current.id + 1,
      pending: true,
    }));
  }, []);

  const consumeCartOverlayActionRequest = useCallback((requestId) => {
    setCartOverlayActionRequest((current) =>
      current.id === requestId
        ? {
            ...current,
            pending: false,
          }
        : current
    );
  }, []);

  useEffect(() => {
    setOverlayProductConfirmations((current) => {
      let next = current;

      shopProducts.forEach((product) => {
        if (
          (overlayProductQuantities[product.name] || 0) === 0 &&
          current[product.name] &&
          !overlayCartProductNames.includes(product.name)
        ) {
          if (next === current) {
            next = { ...current };
          }

          next[product.name] = false;
        }
      });

      return next;
    });
  }, [overlayCartProductNames, overlayProductQuantities]);

  useEffect(() => {
    setOverlayCartProductNames((current) => {
      const next = current.filter(
        (productName) => overlayProductConfirmations[productName]
      );

      return next.length === current.length ? current : next;
    });
  }, [overlayProductConfirmations, overlayProductQuantities]);

  useEffect(() => {
    const previousQuantities = previousOverlayProductQuantitiesRef.current;

    setOverlayCartBillableProductNames((current) => {
      let next = current;

      shopProducts.forEach((product) => {
        const productName = product.name;
        const previousQuantity = previousQuantities[productName] || 0;
        const currentQuantity = overlayProductQuantities[productName] || 0;

        if (previousQuantity > 0 && currentQuantity === 0) {
          if (next.includes(productName)) {
            next = next.filter((name) => name !== productName);
          }

          return;
        }

        if (previousQuantity === 0 && currentQuantity > 0) {
          next = [
            ...next.filter((name) => name !== productName),
            productName,
          ];
        }
      });

      return next === current ? current : next;
    });

    previousOverlayProductQuantitiesRef.current = overlayProductQuantities;
  }, [overlayProductQuantities]);

  const overlayCartProducts = useMemo(
    () =>
      overlayCartProductNames
        .map((productName) =>
          shopProducts.find((product) => product.name === productName)
        )
        .filter(
          (product) =>
            product && overlayProductConfirmations[product.name]
        ),
    [overlayCartProductNames, overlayProductConfirmations]
  );

  const overlayCartBillableProducts = useMemo(
    () =>
      overlayCartBillableProductNames
        .map((productName) =>
          shopProducts.find((product) => product.name === productName)
        )
        .filter(
          (product) =>
            product &&
            overlayProductConfirmations[product.name] &&
            (overlayProductQuantities[product.name] || 0) > 0
        ),
    [
      overlayCartBillableProductNames,
      overlayProductConfirmations,
      overlayProductQuantities,
    ]
  );

  const overlayCartAccruedTotal = useMemo(
    () =>
      overlayCartProducts.reduce(
        (total, product) =>
          total +
          getCartPriceValue(product.overlayPrice || product.price) *
            (overlayProductQuantities[product.name] || 0),
        0
      ),
    [overlayCartProducts, overlayProductQuantities]
  );

  const value = useMemo(
    () => ({
      cartOverlayActionRequest,
      consumeCartOverlayActionRequest,
      discardUnconfirmedOverlayProductDraft,
      overlayCartAccruedTotal,
      overlayCartBillableProducts,
      overlayCartProducts,
      overlayConfirmedProductCount: overlayCartProducts.length,
      overlayProductConfirmations,
      overlayProductQuantities,
      pruneZeroQuantityCartEntries,
      requestCartOverlayOpen,
      isOrderConfirmationOverlayVisible,
      isShopOverlayVisible,
      setIsOrderConfirmationOverlayVisible,
      setIsShopOverlayVisible,
      updateOverlayProductConfirmation,
      updateOverlayProductQuantity,
    }),
    [
      cartOverlayActionRequest,
      consumeCartOverlayActionRequest,
      discardUnconfirmedOverlayProductDraft,
      overlayCartAccruedTotal,
      overlayCartBillableProducts,
      overlayCartProducts,
      overlayProductConfirmations,
      overlayProductQuantities,
      pruneZeroQuantityCartEntries,
      requestCartOverlayOpen,
      isOrderConfirmationOverlayVisible,
      isShopOverlayVisible,
      updateOverlayProductConfirmation,
      updateOverlayProductQuantity,
    ]
  );

  return (
    <ShopCartContext.Provider value={value}>
      {children}
    </ShopCartContext.Provider>
  );
}

export function useShopCart() {
  const context = useContext(ShopCartContext);

  if (!context) {
    throw new Error("useShopCart must be used inside ShopCartProvider");
  }

  return context;
}
