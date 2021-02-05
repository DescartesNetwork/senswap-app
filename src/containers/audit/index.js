import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { DoneRounded, FlightTakeoffRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard } from 'components/cards';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { addPool } from 'modules/pool.reducer';


class Audit extends Component {
  constructor() {
    super();

    this.state = {
      poolAddress: '',
      email: '',
      cgk: '',
      ok: false,
    }
  }

  componentDidMount() {
    this.parseParams();
  }

  componentDidUpdate(prevProps) {
    const { match: prevMatch } = prevProps;
    const { match } = this.props;
    if (!isEqual(match, prevMatch)) this.parseParams();
  }

  parseParams = () => {
    const { match: { params: { poolAddress } } } = this.props;
    const pseudoValue = { target: { value: poolAddress } }
    return this.onPool(pseudoValue);
  }

  onPool = (e) => {
    const poolAddress = e.target.value || '';
    return this.setState({ poolAddress });
  }

  onEmail = (e) => {
    const email = e.target.value || '';
    return this.setState({ email });
  }

  onCGK = (e) => {
    const cgk = e.target.value || '';
    return this.setState({ cgk });
  }

  onSubmit = () => {
    const { poolAddress, email, cgk } = this.state;
    const { setError, addPool } = this.props;
    if (!ssjs.isAddress(poolAddress)) return setError('The pool address is invalid');
    if (!email) return setError('The email is empty');
    if (!cgk) return setError('The CoinGecko link is empty');
    const pool = { address: poolAddress, email, cgk }
    return addPool(pool).then(re => {
      return this.setState({ ok: true });
    }).catch(er => {
      return this.setState({ ok: false }, () => {
        return setError(er);
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { poolAddress, email, cgk, ok } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h4">SenAudit</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Drain small />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    label="Pool address"
                    value={poolAddress}
                    onChange={this.onPool}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    variant="outlined"
                    label="Your email"
                    value={email}
                    onChange={this.onEmail}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    variant="outlined"
                    label="CoinGecko API"
                    placeholder="Example: https://api.coingecko.com/api/v3/coins/01coin"
                    value={cgk}
                    onChange={this.onCGK}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container justify="flex-end" className={classes.noWrap} spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={ok ? <DoneRounded /> : <FlightTakeoffRounded />}
                        disabled={ok}
                        onClick={this.onSubmit}
                      >
                        <Typography>{ok ? 'Submitted' : 'Submit'}</Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  addPool,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Audit)));