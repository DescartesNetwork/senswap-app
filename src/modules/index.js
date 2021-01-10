import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import ui from './ui.reducer';
import wallet from './wallet.reducer';
import faucet from './faucet.reducer';
import pool from './pool.reducer';

export default (history) => combineReducers({
  router: connectRouter(history),
  ui,
  wallet,
  faucet,
  pool,
});