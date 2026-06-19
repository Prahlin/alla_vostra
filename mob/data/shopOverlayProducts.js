export const shopProducts = [
  {
    name: "Piccola",
    price: "$55",
    image: require("../janny1brevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 4, this mouth watering treat is a curation of the finest cheeses and charcuterie found anywhere around South Florida",
  },
  {
    name: "Sei Perfetto",
    price: "$66",
    image: require("../janny2drevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 6, this delicacy effortlessly captures the joyous feeling of being surrounded by beloved family, trusted friends, and loyal clients",
  },
  {
    name: "Buon Natale",
    price: "$77",
    image: require("../janny3erevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 8, this generous cheese board brings a full Alla Vostra spread to large gatherings, joyous celebrations, and festive holiday tables",
  },
];

export const piccolaProduct = shopProducts[0];
export const overlayNavProducts = [
  shopProducts[1],
  shopProducts[0],
  shopProducts[2],
];

export function createInitialShopProductState(initialValue) {
  return shopProducts.reduce((state, product) => {
    state[product.name] = initialValue;
    return state;
  }, {});
}

export function getCartPriceValue(price) {
  const numericPrice = Number(String(price).replace(/[^0-9.]/g, ""));

  return Number.isFinite(numericPrice) ? numericPrice : 0;
}

export function formatCartCurrency(total) {
  return `$${total.toLocaleString("en-US")}`;
}

export function formatCartPriceTotal(price, quantity) {
  return formatCartCurrency(getCartPriceValue(price) * quantity);
}
