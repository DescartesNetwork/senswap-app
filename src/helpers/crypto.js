import pbkdf2 from 'pbkdf2';
import aesjs from 'aes-js';
import cryptoRandomString from 'crypto-random-string';
import { Account } from '@solana/web3.js';


const Crypto = {}

Crypto.hollowKeystore = () => {
  return {
    publicKey: '',
    Crypto: {
      ciphertext: '',
      cipherparams: { counter: Math.floor(100000 + Math.random() * 900000) },
      kdfparams: { c: 8192, dklen: 32, prf: 'sha512', salt: cryptoRandomString({ length: 64 }) }
    }
  }
}

Crypto.fromSolFlareKeystore = (keystore, password) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        publicKey,
        Crypto: {
          ciphertext,
          cipherparams: { counter },
          kdfparams: { c, dklen, prf, salt }
        }
      } = keystore;
      const key = pbkdf2.pbkdf2Sync(password, salt, c, dklen, prf);
      const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
      const secretKey = aesCtr.decrypt(aesjs.utils.hex.toBytes(ciphertext));
      const account = new Account(secretKey);
      if (account.publicKey.toBase58() !== publicKey) throw new Error('Corrupted keystore')
      return resolve(account);
    }
    catch (er) {
      return reject(er);
    }
  });
}

Crypto.createKeystore = (secretKey, password) => {
  return new Promise((resolve, reject) => {
    try {
      if (!secretKey) {
        const account = new Account();
        secretKey = Buffer.from(account.secretKey).toString('hex');
      }
      let keystore = Crypto.hollowKeystore();
      const {
        Crypto: {
          cipherparams: { counter },
          kdfparams: { c, dklen, prf, salt }
        }
      } = keystore;
      const account = new Account(Buffer.from(secretKey, 'hex'));
      const key = pbkdf2.pbkdf2Sync(password, salt, c, dklen, prf);
      const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
      const cipherbuf = aesCtr.encrypt(account.secretKey);
      const ciphertext = aesjs.utils.hex.fromBytes(cipherbuf);
      keystore.publicKey = account.publicKey.toBase58();
      keystore.Crypto.ciphertext = ciphertext;
      return resolve(keystore);
    } catch (er) {
      return reject(er);
    }
  });
}

export default Crypto;