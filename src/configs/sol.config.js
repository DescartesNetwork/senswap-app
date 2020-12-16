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
  swapFactoryAddress: 'B3ZK2uB6jwgpPX788CJ1CttcwT8f6P64px8yCGRj94RU'
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