import ssjs from 'senswapjs';
import WalletInterface from '../walletInterface';

class KeystoreWallet extends WalletInterface {
  constructor(keystore, password) {
    super();

    this.keystore = keystore;
    this.password = password;
  }

  _getAccount = () => {
    return new Promise((resolve, reject) => {
      const account = ssjs.fromKeystore(this.keystore, this.password);
      if (!account || !account.publicKey) return reject('No account');
      const address = account.publicKey.toBase58();
      return resolve(address);
    });
  }

  _sign = (transaction) => {
    return new Promise((resolve, reject) => {
      const account = ssjs.fromKeystore(this.keystore, this.password);
      try {
        const confirmed = window.confirm('Please confirm to sign the traction!');
        if (!confirmed) return reject('User rejects to sign the transaction');
        const address = account.publicKey.toBase58();
        transaction.sign(account);
        return resolve({ address, transaction });
      } catch (er) {
        return reject(er);
      }
    });
  }
}

export default KeystoreWallet;