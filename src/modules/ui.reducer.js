/**
 * Documents
 * @default defaultData
 */

const defaultState = {
  width: 0,
  type: 'xs'
}


/**
 * Responsive
 */
export const SET_SCREEN = 'SET_SCREEN';
export const SET_SCREEN_OK = 'SET_SCREEN_OK';
export const SET_SCREEN_FAIL = 'SET_SCREEN_FAIL';

const getCode = (value) => {
  if (value < 600)
    return 'xs';
  if (value < 960)
    return 'sm';
  if (value < 1280)
    return 'md';
  if (value < 1920)
    return 'lg';
  return 'xl';
}

export const setScreen = (width) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_SCREEN });

      if (typeof (width) !== 'number' || width < 0) {
        const er = 'Input is null';
        dispatch({ type: SET_SCREEN_FAIL, reason: er });
        return reject(er);
      }

      const data = { width, type: getCode(width) };
      dispatch({ type: SET_SCREEN_OK, data });
      return resolve(data);
    });
  };
};

/**
 * Scroll
 */
export const SET_SCROLL = 'SET_SCROLL';
export const SET_SCROLL_OK = 'SET_SCROLL_OK';
export const SET_SCROLL_FAIL = 'SET_SCROLL_FAIL';

export const setScroll = (scrollY) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_SCROLL });

      if (typeof (scrollY) !== 'number' || scrollY < 0) {
        const er = 'Input is null';
        dispatch({ type: SET_SCROLL_FAIL, reason: er });
        return reject(er);
      }

      const { ui: { scrollY: prevScrollY } } = getState();
      const data = { scrollY, direction: prevScrollY > scrollY ? 'up' : 'down' };
      dispatch({ type: SET_SCROLL_OK, data });
      return resolve(data);
    });
  };
};

/**
 * Reducder
 */
export default (state = defaultState, action) => {
  switch (action.type) {
    case SET_SCREEN_OK:
      return { ...state, ...action.data };
    case SET_SCREEN_FAIL:
      return { ...state, ...action.data };
    case SET_SCROLL_OK:
      return { ...state, ...action.data };
    case SET_SCROLL_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}