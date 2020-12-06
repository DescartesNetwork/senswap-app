/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'http://localhost:8899',
  coinbase: {
    address: 'E2ekGTDSxTiviP7Xyx3UtWhqx7ddgVuMwmwisHkpUrnS',
    secretKey: '379158348f716c8c18c1683cf0bc0b0d9d8795f60f79b97e436685181a4d76f9c19430bb5de2a169c3a9111d222148ed42930efb9b6839a8d67fb264ac62ce37'
  },
  tokenFactoryAddress: ''
}

/**
 * Staging configurations
 */
configs.staging = {
  node: '',
  coinbase: {
    address: '',
    secretKey: ''
  },
  tokenFactoryAddress: ''
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  coinbase: {
    address: '',
    secretKey: ''
  },
  tokenFactoryAddress: ''
}

/**
 * Module exports
 */
export default configs;