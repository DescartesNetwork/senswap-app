import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import ui from './ui.reducer';
import wallet from './wallet.reducer';

export default (history) => combineReducers({
  router: connectRouter(history),
  ui,
  wallet,
});