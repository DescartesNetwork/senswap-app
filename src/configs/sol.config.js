/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'http://localhost:8899',
  tokenFactoryAddress: 'Czhz19nU5LSQeAanqwQsGofasTL7QnxhDmgkDP7QvgQT',
  swapFactoryAddress: 'EUH3CGJ5SmStUqiFhGfhqHVL8nwUQ7k2j9nnvWyHQXka'
}

/**
 * Staging configurations
 */
configs.staging = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: ''
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: ''
}

/**
 * Module exports
 */
export default configs;