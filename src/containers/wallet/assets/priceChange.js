import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ssjs from 'senswapjs';

import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';

import { ArrowDropDownRounded, ArrowDropUpRounded } from 'senswap-ui/icons';

function PriceChange(props) {
  const [priceChange, setPriceChange] = useState(0);
  const { ticket } = props;
  useEffect(() => {
    return ssjs.parseCGK(ticket).then(({ priceChange }) => {
      setPriceChange(priceChange);
    }).catch(er => {
      // Do nothing
    });
  }, [ticket]);

  return <Grid container spacing={0}>
    <Grid item style={{ marginLeft: -8 }}> {/* Optical correction */}
      {priceChange < 0 ? < ArrowDropDownRounded
        style={{ color: priceChange < 0 ? '#FF7A68' : '#4FBF67' }}
      /> : <ArrowDropUpRounded
        style={{ color: priceChange < 0 ? '#FF7A68' : '#4FBF67' }}
      />}
    </Grid>
    <Grid item>
      <Typography
        style={{ color: priceChange < 0 ? '#FF7A68' : '#4FBF67' }}
      >{Math.abs(priceChange)}%</Typography>
    </Grid>
  </Grid>
}

PriceChange.defaultProps = {
  ticket: '',
}

PriceChange.propTypes = {
  ticket: PropTypes.string,
}

export default PriceChange;