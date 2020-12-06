const KEY = 'thieng';

const storage = {}

storage.convert = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return false;
  }
}

storage.set = (key, value) => {
  let data = storage.convert(window.localStorage.getItem(KEY));
  if (!data || typeof data !== 'object') {
    data = {}
    data[key] = value;
  }
  else {
    data[key] = value;
  }
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

storage.get = (key) => {
  let data = storage.convert(window.localStorage.getItem(KEY));
  if (!data || typeof data !== 'object') return null;
  return data[key];
}

storage.clear = (key) => {
  storage.set(key, null);
}

export default storage;