import configs from 'configs';
import axios from 'axios';

const API_INSTANCE = axios.create({
  baseURL: configs.api.baseBoard,
  timeout: 60000,
})


/**
 * Documents
 * @default defaultData
 */
const defaultState = {}

/**
 * Get board daily
 */
export const GET_BOARD_DAILY = 'GET_BOARD_DAILY';
export const GET_BOARD_DAILY_OK = 'GET_BOARD_DAILY_OK';
export const GET_BOARD_DAILY_FAIL = 'GET_BOARD_DAILY_FAIL';

export const getBoardDaily = (address, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_BOARD_DAILY });

      let { board: { daily: dailyData } } = getState();
      if (!dailyData || force) {
        const { api: { baseBoard } } = configs;
        console.log('called')
        return API_INSTANCE.get(baseBoard + '/daily/pools/' + address).then(({ data: dailyData }) => {
          const data = { daily: dailyData };
          dispatch({ type: GET_BOARD_DAILY_OK, data });
          return resolve(dailyData);
        }).catch(er => {
          dispatch({ type: GET_BOARD_DAILY_FAIL, reason: er.toString() });
          return reject(er.toString());
        });
      } else {
        dispatch({ type: GET_BOARD_DAILY_OK, dailyData });
        return resolve(dailyData);
      }
    });
  }
}

/**
 * Get board stat
 */
export const GET_BOARD_STAT = 'GET_BOARD_STAT';
export const GET_BOARD_STAT_OK = 'GET_BOARD_STAT_OK';
export const GET_BOARD_STAT_FAIL = 'GET_BOARD_STAT_FAIL';

export const getBoardStat = (address, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_BOARD_DAILY });

      let { board: { stat: statData } } = getState();
      if (!statData || force) {
        const { api: { baseBoard } } = configs;
        return API_INSTANCE.get(baseBoard + '/stat/pools/' + address).then(({ data: statData }) => {
          const data = { stat: statData };
          dispatch({ type: GET_BOARD_DAILY_OK, data });
          return resolve(statData);
        }).catch(er => {
          dispatch({ type: GET_BOARD_DAILY_FAIL, reason: er.toString() });
          return reject(er.toString());
        });
      } else {
        dispatch({ type: GET_BOARD_DAILY_OK, statData });
        return resolve(statData);
      }
    });
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_BOARD_DAILY_OK:
      return { ...state, ...action.data };
    case GET_BOARD_DAILY_FAIL:
      return { ...state, ...action.data };
    case GET_BOARD_STAT_OK:
      return { ...state, ...action.data };
    case GET_BOARD_STAT_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}