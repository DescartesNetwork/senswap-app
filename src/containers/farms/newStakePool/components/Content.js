import Drain from 'senswap-ui/drain';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';

import React from 'react';

export default function NewStakePoolContent() {
  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Typography>
          SEN Token is required.{' '}
          <span style={{ color: '#808191' }}>
            A pool in SenSwap is a trilogy in which SEN plays the role of middle man to reduce fee, leverage routing,
            and realize DAO.
          </span>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          Liquidity provider incentive.{' '}
          <span style={{ color: '#808191' }}>
            Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added
            to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </span>
        </Typography>
      </Grid>
    </React.Fragment>
  );
}
