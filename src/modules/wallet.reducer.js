import ssjs from 'senswapjs';

import configs from 'configs';
import storage from 'helpers/storage';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {
  visible: false,
  user: {
    address: null,
    tokens: [],
    lptAccounts: [],
  },
  accounts: [],
  mainAccount: null,
  qrcode: {
    visible: false,
    message: ''
  },
  unlock: {
    visible: false,
    callback: (_er, _re) => { },
  }
}


/**
 * Open wallet
 */
export const OPEN_WALLET = 'OPEN_WALLET';
export const OPEN_WALLET_OK = 'OPEN_WALLET_OK';
export const OPEN_WALLET_FAIL = 'OPEN_WALLET_FAIL';

export const openWallet = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: OPEN_WALLET });

      const { wallet: { visible } } = getState();
      if (visible) {
        const er = 'Wallet is already opened';
        dispatch({ type: OPEN_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const data = { visible: true };
      dispatch({ type: OPEN_WALLET_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Close wallet
 */
export const CLOSE_WALLET = 'CLOSE_WALLET';
export const CLOSE_WALLET_OK = 'CLOSE_WALLET_OK';
export const CLOSE_WALLET_FAIL = 'CLOSE_WALLET_FAIL';

export const closeWallet = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: CLOSE_WALLET });

      const { wallet: { visible } } = getState();
      if (!visible) {
        const er = 'Wallet is already closed';
        dispatch({ type: CLOSE_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const data = { visible: false };
      dispatch({ type: CLOSE_WALLET_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Set wallet
 */
export const SET_WALLET = 'SET_WALLET';
export const SET_WALLET_OK = 'SET_WALLET_OK';
export const SET_WALLET_FAIL = 'SET_WALLET_FAIL';

export const setWallet = (address, keystore) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_WALLET });

      if (!address || !keystore) {
        const er = 'Invalid input';
        dispatch({ type: SET_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.get(base + '/user', { address }).then(re => {
        if (!re.data) return api.post(base + '/user', { user: { address } });
        return Promise.resolve(re);
      }).then(re => {
        storage.set('address', address);
        storage.set('keystore', keystore);
        const { wallet } = getState();
        const user = { ...wallet.user, ...re.data }
        const data = { user }
        dispatch({ type: SET_WALLET_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: SET_WALLET_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Get wallet
 */
export const GET_WALLET = 'GET_WALLET';
export const GET_WALLET_OK = 'GET_WALLET_OK';
export const GET_WALLET_FAIL = 'GET_WALLET_FAIL';

export const getWallet = () => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_WALLET });

      const address = storage.get('address');
      if (!address) {
        const er = 'Already disconnected';
        dispatch({ type: GET_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.get(base + '/user', { address }).then(({ data: user }) => {
        const data = { user };
        dispatch({ type: GET_WALLET_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_WALLET_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Update wallet
 */
export const UPDATE_WALLET = 'UPDATE_WALLET';
export const UPDATE_WALLET_OK = 'UPDATE_WALLET_OK';
export const UPDATE_WALLET_FAIL = 'UPDATE_WALLET_FAIL';

export const updateWallet = (data) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UPDATE_WALLET });

      if (!data) {
        const er = 'Invalid data';
        dispatch({ type: UPDATE_WALLET_FAIL, reason: er });
        return reject(er);
      }

      data = JSON.parse(JSON.stringify(data));
      dispatch({ type: UPDATE_WALLET_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Sync wallet
 */
export const SYNC_WALLET = 'SYNC_WALLET';
export const SYNC_WALLET_OK = 'SYNC_WALLET_OK';
export const SYNC_WALLET_FAIL = 'SYNC_WALLET_FAIL';

export const syncWallet = (user) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SYNC_WALLET });

      if (!user) {
        const er = 'Invalid data';
        dispatch({ type: SYNC_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.put(base + '/user', { user }).then(({ data: user }) => {
        const data = { user }
        dispatch({ type: SYNC_WALLET_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: SYNC_WALLET_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Unset wallet
 */
export const UNSET_WALLET = 'UNSET_WALLET';
export const UNSET_WALLET_OK = 'UNSET_WALLET_OK';
export const UNSET_WALLET_FAIL = 'UNSET_WALLET_FAIL';

export const unsetWallet = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UNSET_WALLET });

      const { wallet: { user: { address } } } = getState();
      if (!address) {
        const er = 'Already disconnected';
        dispatch({ type: UNSET_WALLET_FAIL, reason: er });
        return reject(er);
      }

      // Local storage
      storage.clear('address');
      storage.clear('keystore');

      const data = { ...defaultState };
      dispatch({ type: UNSET_WALLET_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Set QR Code
 */
export const SET_QRCODE = 'SET_QRCODE';
export const SET_QRCODE_OK = 'SET_QRCODE_OK';
export const SET_QRCODE_FAIL = 'SET_QRCODE_FAIL';

export const setQRCode = (visible = false, message = '') => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_QRCODE });

      const { wallet: { qrcode: {
        visible: prevVisible,
        message: prevMessage
      } } } = getState();
      if (visible === prevVisible && message === prevMessage) {
        const er = 'Duplicated input';
        dispatch({ type: SET_QRCODE_FAIL, reason: er });
        return reject(er);
      }

      const data = { qrcode: { visible, message } };
      dispatch({ type: SET_QRCODE_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Get secret key
 */
export const UNLOCK_WALLET = 'UNLOCK_WALLET';
export const UNLOCK_WALLET_PENDING = 'UNLOCK_WALLET_PENDING';
export const UNLOCK_WALLET_OK = 'UNLOCK_WALLET_OK';
export const UNLOCK_WALLET_FAIL = 'UNLOCK_WALLET_FAIL';

export const unlockWallet = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UNLOCK_WALLET });

      const { wallet: { unlock: { visible: prevVisible } } } = getState();
      if (prevVisible) {
        const er = 'There is another pending request';
        dispatch({ type: UNLOCK_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const EMPTY_DATA = {
        unlock: {
          visible: false,
          callback: (_er, _re) => { },
        }
      }
      const callback = (er, password) => {
        if (er) {
          dispatch({ type: UNLOCK_WALLET_FAIL, data: { ...EMPTY_DATA }, reason: er });
          return reject(er);
        }
        const keystore = storage.get('keystore');
        const account = ssjs.fromKeystore(keystore, password);
        if (!account) {
          er = 'Corrupted keystore / Incorrect password';
          dispatch({ type: UNLOCK_WALLET_FAIL, data: { ...EMPTY_DATA }, reason: er });
          return reject(er);
        }
        const secretKey = Buffer.from(account.secretKey).toString('hex');
        dispatch({ type: UNLOCK_WALLET_OK, data: { ...EMPTY_DATA } });
        return resolve(secretKey);
      }
      const data = { unlock: { visible: true, callback } }
      return dispatch({ type: UNLOCK_WALLET_PENDING, data });
    });
  }
}

/**
 * Set main token account
 */
export const SET_MAIN_ACCOUNT = 'SET_MAIN_ACCOUNT';
export const SET_MAIN_ACCOUNT_OK = 'SET_MAIN_ACCOUNT_OK';
export const SET_MAIN_ACCOUNT_FAIL = 'SET_MAIN_ACCOUNT_FAIL';

export const setMainAccount = (tokenAccount) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_MAIN_ACCOUNT });

      const { wallet: { mainAccount } } = getState();
      if (mainAccount === tokenAccount) {
        const er = 'The token account is same';
        dispatch({ type: SET_MAIN_ACCOUNT_FAIL, reason: er });
        return reject(er);
      }

      const data = { mainAccount: tokenAccount };
      dispatch({ type: SET_MAIN_ACCOUNT_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Reducder
 */
export default (state = defaultState, action) => {
  switch (action.type) {
    case OPEN_WALLET_OK:
      return { ...state, ...action.data };
    case OPEN_WALLET_FAIL:
      return { ...state, ...action.data };
    case CLOSE_WALLET_OK:
      return { ...state, ...action.data };
    case CLOSE_WALLET_FAIL:
      return { ...state, ...action.data };
    case SET_WALLET_OK:
      return { ...state, ...action.data };
    case SET_WALLET_FAIL:
      return { ...state, ...action.data };
    case GET_WALLET_OK:
      return { ...state, ...action.data };
    case GET_WALLET_FAIL:
      return { ...state, ...action.data };
    case UPDATE_WALLET_OK:
      return { ...state, ...action.data };
    case UPDATE_WALLET_FAIL:
      return { ...state, ...action.data };
    case SYNC_WALLET_OK:
      return { ...state, ...action.data };
    case SYNC_WALLET_FAIL:
      return { ...state, ...action.data };
    case UNSET_WALLET_OK:
      return { ...state, ...action.data };
    case UNSET_WALLET_FAIL:
      return { ...state, ...action.data };
    case SET_QRCODE_OK:
      return { ...state, ...action.data };
    case SET_QRCODE_FAIL:
      return { ...state, ...action.data };
    case UNLOCK_WALLET_OK:
      return { ...state, ...action.data };
    case UNLOCK_WALLET_PENDING:
      return { ...state, ...action.data };
    case UNLOCK_WALLET_FAIL:
      return { ...state, ...action.data };
    case SET_MAIN_ACCOUNT_OK:
      return { ...state, ...action.data };
    case SET_MAIN_ACCOUNT_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}