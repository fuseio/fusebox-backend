export default () => ({
  TradeApiV2Controller: {
    baseUrl: `${process.env.VOLTAGE_ROUTER_API_URL}/swap/v1`,
    replaceHeaders: false
  }
})
