import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import { EcoRounded, MonetizationOnRounded, LocalGasStation } from '@material-ui/icons';

import Drain from 'components/drain';
import NetworkSelection from 'containers/wallet/components/networkSelection';
import Token from './token';
import Pools from './pools';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';


class NetworkInfo extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }
  }

  onData = (data) => {
    return this.setState({ data });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { user: { role } } } = this.props;
    const { data } = this.state;
    const mints = data.mints || [];
    const vault = data.vault || {};
    const primary = data.primary || {};
    const sen = utils.prettyNumber(ssjs.undecimalize(vault.amount, primary.decimals));

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <NetworkSelection onChange={this.onData} />
      </Grid>
      <Grid item xs={12}>
        <Drain small />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} justify="center">
          <Grid item>
            <Typography variant="h1">{sen}<span className={classes.subtitle}> 𑁍 SEN</span></Typography>
          </Grid>
          <Grid item xs={12} />
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EcoRounded />}
            >
              <Typography>Earn</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Drain small />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="body2" align="right">Tokens listed in Network</Typography>
          </Grid>
          <Grid item>
            <IconButton size="small" color="secondary">
              <MonetizationOnRounded fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.network}>
        <Grid container spacing={1}>
          {mints.map((address, index) => <Grid item key={index}>
            <Token address={address} readOnly />
          </Grid>)}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Drain small />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="body2" align="right">Pools in Network</Typography>
          </Grid>
          <Grid item>
            <IconButton size="small" color="secondary">
              <LocalGasStation fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Pools networkAddress={data.address} readOnly={role !== 'admin'} />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NetworkInfo)));