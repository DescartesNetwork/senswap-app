/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'http://localhost:8899',
  tokenFactoryAddress: 'BcfSEsgAp5cfTS18CQTWibq63KJoR2Rkd6ENXu5AyaWU',
  swapFactoryAddress: '8cuydwpLrxZy57Ehq6cr7nMzDQmcwHwjsakjT2gAsous',
}

/**
 * Staging configurations
 */
configs.staging = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: '',
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: '',
}

/**
 * Module exports
 */
export default configs;