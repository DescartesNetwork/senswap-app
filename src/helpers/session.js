const db = window.sessionStorage;

const session = {}

session.set = (key, value) => {
  return db.setItem(key, value);
}

session.get = (key) => {
  const data = db.getItem(key);
  return data;
}

session.clear = (key) => {
  return session.set(key, null);
}

export default session;