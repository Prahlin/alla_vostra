const shouldDisableApplePayEntitlement =
  process.env.ALLA_VOSTRA_DISABLE_APPLE_PAY_ENTITLEMENT === "1";

function getPlugins(plugins = []) {
  if (!shouldDisableApplePayEntitlement) {
    return plugins;
  }

  return plugins.map((plugin) => {
    if (
      Array.isArray(plugin) &&
      plugin[0] === "@stripe/stripe-react-native" &&
      plugin[1]
    ) {
      const { merchantIdentifier, ...stripeOptions } = plugin[1];

      return [plugin[0], stripeOptions];
    }

    return plugin;
  });
}

module.exports = ({ config }) => ({
  ...config,
  plugins: getPlugins(config.plugins),
});
