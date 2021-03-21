import configs from 'configs';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {}

/**
 * Get network
 */
export const GET_NETWORK = 'GET_NETWORK';
export const GET_NETWORK_OK = 'GET_NETWORK_OK';
export const GET_NETWORK_FAIL = 'GET_NETWORK_FAIL';

export const getNetwork = (_id, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_NETWORK });

      let { network: { [_id]: networkData } } = getState();
      if (!networkData || force) {
        const { api: { base } } = configs;
        return api.get(base + '/network', { _id }).then(({ data: networkData }) => {
          const data = { [_id]: networkData }
          dispatch({ type: GET_NETWORK_OK, data });
          return resolve(JSON.parse(JSON.stringify(networkData)));
        }).catch(er => {
          dispatch({ type: GET_NETWORK_FAIL, reason: er.toString() });
          return reject(er.toString());
        });
      } else {
        const data = { [_id]: networkData }
        dispatch({ type: GET_NETWORK_OK, data });
        return resolve(networkData);
      }
    });
  }
}

/**
 * Get networks
 */
export const GET_NETWORKS = 'GET_NETWORKS';
export const GET_NETWORKS_OK = 'GET_NETWORKS_OK';
export const GET_NETWORKS_FAIL = 'GET_NETWORKS_FAIL';

export const getNetworks = (condition, limit, page) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_NETWORKS });

      const { api: { base } } = configs;
      return api.get(base + '/networks', { condition, limit, page }).then(({ data }) => {
        dispatch({ type: GET_NETWORKS_OK, data: {} });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_NETWORKS_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Add a network
 */
export const ADD_NETWORK = 'ADD_NETWORK';
export const ADD_NETWORK_OK = 'ADD_NETWORK_OK';
export const ADD_NETWORK_FAIL = 'ADD_NETWORK_FAIL';

export const addNetwork = (network, secretKey) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: ADD_NETWORK });

      if (!secretKey) {
        const er = 'Unauthenticated request';
        dispatch({ type: ADD_NETWORK_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.post(base + '/network', { network }, secretKey).then(({ data: networkData }) => {
        const data = { [networkData._id]: networkData }
        dispatch({ type: ADD_NETWORK_OK, data });
        return resolve(networkData);
      }).catch(er => {
        dispatch({ type: ADD_NETWORK_FAIL, reason: er.toString() });
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
    case GET_NETWORK_OK:
      return { ...state, ...action.data };
    case GET_NETWORK_FAIL:
      return { ...state, ...action.data };
    case GET_NETWORKS_OK:
      return { ...state, ...action.data };
    case GET_NETWORKS_FAIL:
      return { ...state, ...action.data };
    case ADD_NETWORK_OK:
      return { ...state, ...action.data };
    case ADD_NETWORK_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}