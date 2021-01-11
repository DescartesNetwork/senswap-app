import configs from 'configs';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {
}

/**
 * Get pool
 */
export const GET_POOL = 'GET_POOL';
export const GET_POOL_OK = 'GET_POOL_OK';
export const GET_POOL_FAIL = 'GET_POOL_FAIL';

export const getPool = (_id) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_POOL });

      const { api: { base } } = configs;
      return api.get(base + '/pool', { _id }).then(({ data }) => {
        dispatch({ type: GET_POOL_OK, data: {} });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_POOL_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Get pools
 */
export const GET_POOLS = 'GET_POOLS';
export const GET_POOLS_OK = 'GET_POOLS_OK';
export const GET_POOLS_FAIL = 'GET_POOLS_FAIL';

export const getPools = (condition, limit, page) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_POOLS });

      const { api: { base } } = configs;
      return api.get(base + '/pools', { condition, limit, page }).then(({ data }) => {
        dispatch({ type: GET_POOLS_OK, data: {} });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_POOLS_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Add a pool
 */
export const ADD_POOL = 'ADD_POOL';
export const ADD_POOL_OK = 'ADD_POOL_OK';
export const ADD_POOL_FAIL = 'ADD_POOL_FAIL';

export const addPool = (pool) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: ADD_POOL });

      const { api: { base } } = configs;
      return api.post(base + '/pool', { pool }).then(({ data }) => {
        dispatch({ type: ADD_POOL_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: ADD_POOL_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Reducder
 */
export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_POOL_OK:
      return { ...state, ...action.data };
    case GET_POOL_FAIL:
      return { ...state, ...action.data };
    case GET_POOLS_OK:
      return { ...state, ...action.data };
    case GET_POOLS_FAIL:
      return { ...state, ...action.data };
    case ADD_POOL_OK:
      return { ...state, ...action.data };
    case ADD_POOL_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}