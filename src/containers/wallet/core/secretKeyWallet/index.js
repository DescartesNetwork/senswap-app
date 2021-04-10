import ssjs from 'senswapjs';
import KeystoreWallet from '../keystoreWallet';

class SecretKeyWallet extends KeystoreWallet {
  constructor(secretKey, password) {
    super(ssjs.encrypt(secretKey, password), password);
  }
}

export default SecretKeyWallet;