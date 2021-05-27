import React, { Component, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import numeral from 'numeral';
import ssjs from 'senswapjs';

import { withStyles, makeStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import Divider from 'senswap-ui/divider';
import Avatar from 'senswap-ui/avatar';
import Chip from 'senswap-ui/chip';

import { HelpOutlineRounded, ArrowDropDownRounded, ArrowDropUpRounded } from 'senswap-ui/icons';

import styles from './styles';

const useStyles = makeStyles(theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
}));

function Price(props) {
  const classes = useStyles();
  const [price, setPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const { ticket } = props;
  useEffect(() => {
    return (async () => {
      try {
        const { price, priceChange } = await ssjs.parseCGK(ticket);
        setPrice(price);
        setPriceChange(priceChange);
      } catch (er) { /* Do nothing */ }
    })();
  }, [ticket]);
  return <Grid container className={classes.noWrap} alignItems="flex-end">
    <Grid item className={classes.stretch}>
      <Typography variant="h5">${numeral(price).format('0.0[0]')}</Typography>
    </Grid>
    <Grid item>
      <Grid container spacing={0} className={classes.noWrap}>
        <Grid item>
          {priceChange < 0 ? < ArrowDropDownRounded
            style={{ color: priceChange < 0 ? '#FF7A68' : '#4FBF67' }}
          /> : <ArrowDropUpRounded
            style={{ color: priceChange < 0 ? '#FF7A68' : '#4FBF67' }}
          />}
        </Grid>
        <Grid item>
          <Typography
            style={{ color: priceChange < 0 ? '#FF7A68' : '#4FBF67' }}
          >{numeral(Math.abs(priceChange)).format('0.0[0]')}%</Typography>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
}

class Reference extends Component {

  render() {
    const { classes, poolData } = this.props;
    const { address: poolAddress, mint_a, mint_b, mint_s } = poolData;
    const { icon: iconA, symbol: symbolA, ticket: ticketA } = mint_a || {};
    const { icon: iconB, symbol: symbolB, ticket: ticketB } = mint_b || {};
    const { icon: iconS, symbol: symbolS, ticket: ticketS } = mint_s || {};
    const icons = [iconA, iconB, iconS];
    const symbols = [symbolA, symbolB, symbolS];
    const tickets = [ticketA, ticketB, ticketS];

    if (!ssjs.isAddress(poolAddress)) return null;
    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Reference Prices</Typography>
        </Grid>
        {[0, 1, 2].map(i => <Fragment key={i}>
          <Grid item xs={12}>
            <Grid container className={classes.noWrap} alignItems="center" spacing={1}>
              <Grid item>
                <Avatar src={icons[i]} className={classes.icon} >
                  <HelpOutlineRounded />
                </Avatar>
              </Grid>
              <Grid item className={classes.stretch}>
                <Typography>{symbols[i]}</Typography>
              </Grid>
              <Grid item>
                <Chip label="24H" className={classes.chip} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Price ticket={tickets[i]} />
          </Grid>
          {i !== 2 ? <Grid item xs={12}>
            <Divider />
          </Grid> : null}
        </Fragment>)}
      </Grid>
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Reference.defaultProps = {
  poolData: {}
}

Reference.propTypes = {
  poolData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Reference)));