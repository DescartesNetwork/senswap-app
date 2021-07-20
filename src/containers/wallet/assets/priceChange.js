import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';

import { ArrowDropDownRounded, ArrowDropUpRounded } from 'senswap-ui/icons';
import Utils from 'helpers/utils';


const useStyles = makeStyles(theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  opticalCorrection: {
    marginLeft: -8
  }
}));

function PriceChange(props) {
  const classes = useStyles();
  const [priceChange, setPriceChange] = useState(0);
  const { ticket } = props;
  useEffect(() => {
    return Utils.fetchCGK(ticket).then(({ priceChange }) => {
      setPriceChange(priceChange);
    }).catch(er => {
      // Do nothing
    });
  }, [ticket]);

  return <Grid container spacing={0} className={classes.noWrap}>
    <Grid item className={classes.opticalCorrection}>
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