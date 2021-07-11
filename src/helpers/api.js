import ssjs from 'senswapjs';
import axios from 'axios';

const api = {}

/**
 * Build access token
 */
api.auth = async (auth = false) => {
  if (!auth) return null;
  const wallet = window.senswap.wallet;
  if (!wallet) throw new Error('Wallet is not connected');
  const datetime = Number(new Date()) + 60000; // Valid in 10s
  const msg = datetime.toString() + ssjs.salt();
  const { address, sig } = await wallet.certify(msg);
  const authHeader = `${address} ${sig}`;
  return authHeader;
}

/**
 * CRUD Model
 */

// Create
api.post = async (url, params = null, auth = true) => {
  const authHeader = await api.auth(auth);
  try {
    const { data } = await axios({
      method: 'post',
      url: url,
      data: params,
      headers: { 'Authorization': authHeader }
    });
    if (data.status === 'ERROR') throw new Error(data.error);
    return data;
  } catch (er) {
    if (!er.response) throw new Error(er.message);
    const { response: { data: { error } } } = er;
    throw new Error(error);
  }
}

// Read
api.get = async (url, params = null, auth = false) => {
  const authHeader = await api.auth(auth);
  try {
    const { data } = await axios({
      method: 'get',
      url: url,
      params: params,
      headers: { 'Authorization': authHeader }
    });
    if (data.status === 'ERROR') throw new Error(data.error);
    return data;
  } catch (er) {
    if (!er.response) throw new Error(er.message);
    const { response: { data: { error } } } = er;
    throw new Error(error);
  }
}

// Update
api.put = async (url, params = null, auth = true) => {
  const authHeader = await api.auth(auth);
  try {
    const { data } = await axios({
      method: 'put',
      url: url,
      data: params,
      headers: { 'Authorization': authHeader }
    });
    if (data.status === 'ERROR') throw new Error(data.error);
    return data;
  } catch (er) {
    if (!er.response) throw new Error(er.message);
    const { response: { data: { error } } } = er;
    throw new Error(error);
  }
}

// Delete
api.delete = async (url, params = null, auth = true) => {
  const authHeader = await api.auth(auth);
  try {
    const { data } = await axios({
      method: 'delete',
      url: url,
      data: params,
      headers: { 'Authorization': authHeader }
    });
    if (data.status === 'ERROR') throw new Error(data.error);
    return data;
  } catch (er) {
    if (!er.response) throw new Error(er.message);
    const { response: { data: { error } } } = er;
    throw new Error(error);
  }
}

export default api;