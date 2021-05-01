import ssjs from 'senswapjs';

import configs from 'configs';
import storage from 'helpers/storage';
import session from 'helpers/session';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {
  visible: false,
  lamports: 0,
  user: {
    address: null,
    role: 'user',
    mints: [],
    pools: [],
  },
  accounts: [],
  lpts: [],
  mainAccount: null,
  qrcode: {
    visible: false,
    message: ''
  },
  unlock: {
    visible: false,
    remembered: '',
    callback: (er, re) => { },
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

export const setWallet = (wallet) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_WALLET });

      if (!wallet) {
        const er = 'Invalid wallet instance';
        dispatch({ type: SET_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      let address = null;
      return wallet.getAccount().then(re => {
        address = re;
        return api.get(base + '/user', { address });
      }).then(re => {
        if (!re.data) return api.post(base + '/user', { user: { address } });
        return Promise.resolve(re);
      }).then(({ data: userData }) => {
        window.senswap.wallet = wallet;
        const { wallet: { user } } = getState();
        const data = { user: { ...user, ...userData }, visible: false }
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

export const syncWallet = (secretKey) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SYNC_WALLET });

      const { wallet: { user } } = getState();
      if (!user || !secretKey) {
        const er = 'Invalid data';
        dispatch({ type: SYNC_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.put(base + '/user', { user }, secretKey).then(({ data: user }) => {
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
      storage.clear('WalletType');
      storage.clear('SecretKey');

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

      const { wallet: { unlock: { visible: prevVisible }, remembered } } = getState();
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
          er = 'Incorrect password';
          dispatch({ type: UNLOCK_WALLET_FAIL, reason: er });
          return reject(er);
        }
        const secretKey = Buffer.from(account.secretKey).toString('hex');
        dispatch({ type: UNLOCK_WALLET_OK, data: { ...EMPTY_DATA } });
        return resolve(secretKey);
      }

      // Remember me?
      if (remembered) {
        const password = session.get(remembered);
        return callback(null, password);
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

export const setMainAccount = (accountAddress) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_MAIN_ACCOUNT });

      const { wallet: { mainAccount } } = getState();
      if (mainAccount === accountAddress) {
        const er = 'The token account is same';
        dispatch({ type: SET_MAIN_ACCOUNT_FAIL, reason: er });
        return reject(er);
      }

      const data = { mainAccount: accountAddress };
      dispatch({ type: SET_MAIN_ACCOUNT_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Set remembered
 */
export const SET_REMEMBERED = 'SET_REMEMBERED';
export const SET_REMEMBERED_OK = 'SET_REMEMBERED_OK';
export const SET_REMEMBERED_FAIL = 'SET_REMEMBERED_FAIL';

export const setRemembered = (password) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_REMEMBERED });

      const { wallet: { remembered } } = getState();
      if (remembered && password) {
        const er = 'Already remembered';
        dispatch({ type: SET_REMEMBERED_FAIL, reason: er });
        return reject(er);
      }
      if (!remembered && !password) {
        const er = 'Not yet remembered';
        dispatch({ type: SET_REMEMBERED_FAIL, reason: er });
        return reject(er);
      }

      // Forget
      if (!password) {
        const data = { remembered: '' };
        dispatch({ type: SET_REMEMBERED_OK, data });
        return resolve(data);
      }
      // Store to sessionStorage
      const key = ssjs.crypto.hash(ssjs.salt());
      session.set(key, password);
      // Remember key
      const data = { remembered: key };
      dispatch({ type: SET_REMEMBERED_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
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
    case SET_REMEMBERED_OK:
      return { ...state, ...action.data };
    case SET_REMEMBERED_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}