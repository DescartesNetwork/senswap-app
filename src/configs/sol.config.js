/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'https://devnet.solana.com',
  spltAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  splataAddress: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  swapAddress: 'BVK3vduDFLbPouYBPBd8gpKjHSaj88mN2aTMbjQaXPda',
  senAddress: 'D8UuF1jPr5gtxHvnVz3HpxP2UkgtxLs9vwz7ecaTkrGy',
  cluster: 'devnet',
}

/**
 * Staging configurations
 */
configs.staging = {
  node: 'https://devnet.solana.com',
  spltAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  splataAddress: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  swapAddress: 'BVK3vduDFLbPouYBPBd8gpKjHSaj88mN2aTMbjQaXPda',
  senAddress: 'D8UuF1jPr5gtxHvnVz3HpxP2UkgtxLs9vwz7ecaTkrGy',
  cluster: 'devnet',
}

/**
 * Production configurations
 */
configs.production = {
  node: 'https://api.mainnet-beta.solana.com',
  spltAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  splataAddress: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  swapAddress: 'SenTTyY6aynBEQ6ZKTF4ex16Bq9E2R5zhm7yjzXjTeX',
  senAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
  cluster: 'mainnet',
}

/**
 * Module exports
 */
export default configs;