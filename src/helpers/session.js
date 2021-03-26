import ssjs from 'senswapjs';

/**
 * This sessionStorage have to be encrypted
 * This is not secure in term of cryptography but help to blind the tamperer
 */
const db = window.sessionStorage;

const session = {}

session.set = (key, value) => {
  const hash = ssjs.crypto.hash(key);
  const cypher = ssjs.crypto.encrypt(hash, value + hash);
  return db.setItem(hash, cypher);
}

session.get = (key) => {
  const hash = ssjs.crypto.hash(key);
  const cypher = db.getItem(hash);
  const plain = ssjs.crypto.decrypt(hash, cypher);
  const data = plain.replace(hash, '');
  return data;
}

session.clear = (key) => {
  const hash = ssjs.crypto.hash(key);
  return session.set(hash, null);
}

export default session;