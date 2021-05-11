import ssjs from 'senswapjs';
import axios from 'axios';

const api = {}

/**
 * Build access token
 */
api.auth = (auth = false) => {
  return new Promise((resolve, reject) => {
    if (!auth) return resolve(null);
    const wallet = window.senswap.wallet;
    if (!wallet) return reject('Wallet is not connected');
    const datetime = Number(new Date()) + 60000; // Valid in 10s
    const msg = datetime.toString() + ssjs.salt();
    return wallet.certify(msg).then(({ address, sig }) => {
      const authHeader = `${address} ${sig}`;
      return resolve(authHeader);
    }).catch(er => {
      return reject(er);
    });
  });
}

/**
 * CRUD Model
 */

// Create
api.post = (url, params = null, auth = false) => {
  return new Promise((resolve, reject) => {
    return api.auth(auth).then(authHeader => {
      return axios({
        method: 'post',
        url: url,
        data: params,
        headers: { 'Authorization': authHeader }
      });
    }).then(re => {
      let data = re.data;
      if (data.status === 'ERROR') return reject(data.error);
      return resolve(data);
    }).catch(er => {
      if (er.response) {
        const { response: { data: { error } } } = er;
        return reject(error);
      }
      return reject(er.message);
    });
  });
}

// Read
api.get = (url, params = null, auth = false) => {
  return new Promise((resolve, reject) => {
    return api.auth(auth).then(authHeader => {
      return axios({
        method: 'get',
        url: url,
        params: params,
        headers: { 'Authorization': authHeader }
      });
    }).then(re => {
      let data = re.data;
      if (data.status === 'ERROR') return reject(data.error);
      return resolve(data);
    }).catch(er => {
      if (er.response) {
        const { response: { data: { error } } } = er;
        return reject(error);
      }
      return reject(er.message);
    });
  });
}

// Update
api.put = (url, params = null, auth = false) => {
  return new Promise((resolve, reject) => {
    return api.auth(auth).then(authHeader => {
      return axios({
        method: 'put',
        url: url,
        data: params,
        headers: { 'Authorization': authHeader }
      });
    }).then(re => {
      let data = re.data;
      if (data.status === 'ERROR') return reject(data.error);
      return resolve(data);
    }).catch(er => {
      if (er.response) {
        const { response: { data: { error } } } = er;
        return reject(error);
      }
      return reject(er.message);
    });
  });
}

// Delete
api.delete = (url, params = null, auth = false) => {
  return new Promise((resolve, reject) => {
    api.auth(auth).then(authHeader => {
      return axios({
        method: 'delete',
        url: url,
        data: params,
        headers: { 'Authorization': authHeader }
      });
    }).then(re => {
      let data = re.data;
      if (data.status === 'ERROR') return reject(data.error);
      return resolve(data);
    }).catch(er => {
      if (er.response) {
        const { response: { data: { error } } } = er;
        return reject(error);
      }
      return reject(er.message);
    });
  })
}

export default api;