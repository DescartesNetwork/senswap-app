import configs from 'configs';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {}

/**
 * Get mint
 */
export const GET_MINT = 'GET_MINT';
export const GET_MINT_OK = 'GET_MINT_OK';
export const GET_MINT_FAIL = 'GET_MINT_FAIL';

export const getMint = (address, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_MINT });

      let { mint: { [address]: mintData } } = getState();
      if (!mintData || force) {
        const { api: { base } } = configs;
        return api.get(base + '/mint', { address }).then(({ data: mintData }) => {
          const data = { [address]: mintData }
          dispatch({ type: GET_MINT_OK, data });
          return resolve(JSON.parse(JSON.stringify(mintData)));
        }).catch(er => {
          dispatch({ type: GET_MINT_FAIL, reason: er.toString() });
          return reject(er.toString());
        });
      } else {
        const data = { [address]: mintData }
        dispatch({ type: GET_MINT_OK, data });
        return resolve(mintData);
      }
    });
  }
}

/**
 * Get mints
 */
export const GET_MINTS = 'GET_MINTS';
export const GET_MINTS_OK = 'GET_MINTS_OK';
export const GET_MINTS_FAIL = 'GET_MINTS_FAIL';

export const getMints = (condition, limit, page) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_MINTS });

      const { api: { base } } = configs;
      return api.get(base + '/mints', { condition, limit, page }).then(({ data }) => {
        dispatch({ type: GET_MINTS_OK, data: {} });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_MINTS_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Add a mint
 */
export const ADD_MINT = 'ADD_MINT';
export const ADD_MINT_OK = 'ADD_MINT_OK';
export const ADD_MINT_FAIL = 'ADD_MINT_FAIL';

export const addMint = (mint) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: ADD_MINT });

      if (!mint) {
        const er = 'Invalid mint data';
        dispatch({ type: ADD_MINT_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.post(base + '/mint', { mint }, true).then(({ data: mintData }) => {
        const data = { [mintData.address]: mintData }
        dispatch({ type: ADD_MINT_OK, data });
        return resolve(mintData);
      }).catch(er => {
        dispatch({ type: ADD_MINT_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Update a mint
 */
export const UPDATE_MINT = 'UPDATE_MINT';
export const UPDATE_MINT_OK = 'UPDATE_MINT_OK';
export const UPDATE_MINT_FAIL = 'UPDATE_MINT_FAIL';

export const updateMint = (mint) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UPDATE_MINT });

      if (!mint) {
        const er = 'Invalid mint data';
        dispatch({ type: ADD_MINT_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.put(base + '/mint', { mint }, true).then(({ data: mintData }) => {
        const data = { [mintData.address]: mintData }
        dispatch({ type: UPDATE_MINT_OK, data });
        return resolve(mintData);
      }).catch(er => {
        dispatch({ type: UPDATE_MINT_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Delete a mint
 */
export const DELETE_MINT = 'DELETE_MINT';
export const DELETE_MINT_OK = 'DELETE_MINT_OK';
export const DELETE_MINT_FAIL = 'DELETE_MINT_FAIL';

export const deleteMint = (mint) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: DELETE_MINT });

      if (!mint) {
        const er = 'Invalid mint data';
        dispatch({ type: DELETE_MINT_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.delete(base + '/mint', { mint }, true).then(({ data: mintData }) => {
        const data = { [mintData.address]: null }
        dispatch({ type: DELETE_MINT_OK, data });
        return resolve(mintData);
      }).catch(er => {
        dispatch({ type: DELETE_MINT_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_MINT_OK:
      return { ...state, ...action.data };
    case GET_MINT_FAIL:
      return { ...state, ...action.data };
    case GET_MINTS_OK:
      return { ...state, ...action.data };
    case GET_MINTS_FAIL:
      return { ...state, ...action.data };
    case ADD_MINT_OK:
      return { ...state, ...action.data };
    case ADD_MINT_FAIL:
      return { ...state, ...action.data };
    case UPDATE_MINT_OK:
      return { ...state, ...action.data };
    case UPDATE_MINT_FAIL:
      return { ...state, ...action.data };
    case DELETE_MINT_OK:
      return { ...state, ...action.data };
    case DELETE_MINT_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}