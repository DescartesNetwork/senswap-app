const KEY = 'senswap';
const db = window.sessionStorage;

const session = {}

session.convert = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return false;
  }
}

session.set = (key, value) => {
  let data = session.convert(db.getItem(KEY));
  if (!data || typeof data !== 'object') {
    data = {}
    data[key] = value;
  }
  else {
    data[key] = value;
  }
  db.setItem(KEY, JSON.stringify(data));
}

session.get = (key) => {
  let data = session.convert(db.getItem(KEY));
  if (!data || typeof data !== 'object') return null;
  return data[key];
}

session.clear = (key) => {
  session.set(key, null);
}

export default session;