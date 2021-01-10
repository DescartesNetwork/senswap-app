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
  swapFactoryAddress: '2Jr4gCRGr6vpb6sEJBiWqYAgzy1AsR4EXWDsG7K64AdT',
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