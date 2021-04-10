import ssjs from 'senswapjs';
import bs58 from 'bs58';
import WalletInterface from '../walletInterface';

class Coin98Wallet extends WalletInterface {

  _getNode = () => {
    const { coin98 } = window;
    const { sol } = coin98 || {};
    if (!sol) throw new Error('Wallet is not connected');
    return sol;
  }

  _getAccount = () => {
    return new Promise((resolve, reject) => {
      const node = this._getNode();
      return node.request({ method: 'sol_accounts' }).then(([account]) => {
        if (!account) return reject('There is no Solana account');
        return resolve(account);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  _sign = (transaction) => {
    return new Promise((resolve, reject) => {
      const node = this._getNode();
      return this.getAccount().then(account => {
        transaction.feePayer = ssjs.fromAddress(account);
        return node.request({ method: 'sol_sign', params: [transaction] })
      }).then(re => {
        if (!re) return reject('Cannot sign the transaction');
        const { publicKey: address, signature: bs58Sign } = re;
        const publicKey = ssjs.fromAddress(address);
        const signature = bs58.decode(bs58Sign);
        transaction.addSignature(publicKey, signature);
        return resolve({ address, transaction });
      }).catch(er => {
        return reject(er);
      });
    });
  }
}

export default Coin98Wallet;