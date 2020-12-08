const KEY = 'senswap';
const db = window.sessionStorage;

const storage = {}

storage.convert = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return false;
  }
}

storage.set = (key, value) => {
  let data = storage.convert(db.getItem(KEY));
  if (!data || typeof data !== 'object') {
    data = {}
    data[key] = value;
  }
  else {
    data[key] = value;
  }
  db.setItem(KEY, JSON.stringify(data));
}

storage.get = (key) => {
  let data = storage.convert(db.getItem(KEY));
  if (!data || typeof data !== 'object') return null;
  return data[key];
}

storage.clear = (key) => {
  storage.set(key, null);
}

export default storage;