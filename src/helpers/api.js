import ssjs from 'senswapjs';
import axios from 'axios';

const api = {}

/**
 * Build access token
 */
api.auth = (secretKey) => {
  try {
    const address = ssjs.fromSecretKey(secretKey).publicKey.toBase58();
    const datetime = Number(new Date()) + 10000; // Valid in 10s
    const msg = datetime.toString() + ssjs.salt();
    const { sig: accessToken } = ssjs.sign(msg, secretKey);
    const authHeader = `${address} ${accessToken}`;
    return authHeader;
  } catch (er) {
    return null;
  }
}

/**
 * CRUD Model
 */

// Create
api.post = (url, params = null, secretKey = null) => {
  return new Promise((resolve, reject) => {
    return axios({
      method: 'post',
      url: url,
      data: params,
      headers: { 'Authorization': api.auth(secretKey) }
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
api.get = (url, params = null, secretKey = null) => {
  return new Promise((resolve, reject) => {
    return axios({
      method: 'get',
      url: url,
      params: params,
      headers: { 'Authorization': api.auth(secretKey) }
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
api.put = (url, params = null, secretKey = null) => {
  return new Promise((resolve, reject) => {
    return axios({
      method: 'put',
      url: url,
      data: params,
      headers: { 'Authorization': api.auth(secretKey) }
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
api.delete = (url, params = null, secretKey = null) => {
  return new Promise((resolve, reject) => {
    return axios({
      method: 'delete',
      url: url,
      data: params,
      headers: { 'Authorization': api.auth(secretKey) }
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