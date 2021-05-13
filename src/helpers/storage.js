const KEY = 'senswap';
const db = window.localStorage;

const storage = {}

storage._convert = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return false;
  }
}

storage.set = (key, value) => {
  let data = storage._convert(db.getItem(KEY));
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
  let data = storage._convert(db.getItem(KEY));
  if (!data || typeof data !== 'object') return null;
  return data[key];
}

storage.clear = (key) => {
  storage.set(key, null);
}

export default storage;