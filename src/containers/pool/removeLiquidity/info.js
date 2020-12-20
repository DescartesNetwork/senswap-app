import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import { InfoRounded } from '@material-ui/icons';

import utils from 'helpers/utils';
import sol from 'helpers/sol';
import styles from './styles';
import { Typography } from '@material-ui/core';


class Info extends Component {
  constructor() {
    super();

    this.state = {
      senData: {},
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { senAddress: prevSenAddress } = prevProps;
    const { senAddress } = this.props;
    if (!isEqual(senAddress, prevSenAddress)) this.fetchData();
  }

  fetchData = () => {
    const { senAddress } = this.props;
    if (!sol.isAddress(senAddress)) return;
    return sol.getPoolData(senAddress).then(re => {
      return this.setState({ senData: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { senData: { initialized } } = this.state;
    if (!initialized) return null;
    const {
      senData: {
        sen: amount,
        pool: {
          address: poolAddress,
          reserve: poolReserve,
          sen: poolSen,
          token
        },
      }
    } = this.state;
    const symbol = token.symbol.join('').replace('-', '');
    const sen = utils.prettyNumber(utils.div(amount, global.BigInt(10 ** token.decimals)));
    const reserve = utils.prettyNumber(utils.div(poolReserve, global.BigInt(10 ** token.decimals)));
    const price = utils.div(poolSen, poolReserve);

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <IconButton color="primary" size="small">
              <InfoRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="body2">Pool Information</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={`${symbol} Pool`}
          variant="outlined"
          value={poolAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Your current SEN"
          variant="outlined"
          value={sen}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Pool Reserve"
          variant="outlined"
          value={reserve}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label={`${symbol} Price`}
          variant="outlined"
          value={price}
          fullWidth
        />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Info.defaultProps = {
  senAddress: '',
}

Info.propTypes = {
  senAddress: PropTypes.string,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));