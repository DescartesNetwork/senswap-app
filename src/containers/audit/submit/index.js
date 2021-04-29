import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';

import TextField from '@material-ui/core/TextField';

import { FlightTakeoffRounded } from 'senswap-ui/icons';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { addPool } from 'modules/pool.reducer';


const EMPTY = {
  loading: false,
  done: false
}

class SubmitPool extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      poolAddress: '',
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

  onSubmit = () => {
    const { poolAddress } = this.state;
    const { setError, addPool } = this.props;
    if (!ssjs.isAddress(poolAddress)) return setError('The pool address is invalid');
    const pool = { address: poolAddress }
    return this.setState({ loading: true }, () => {
      return addPool(pool).then(re => {
        return this.setState({ ...EMPTY, done: true });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { poolAddress, loading, done } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Request info</Typography>
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
      <Grid item xs={12}>
        <Grid container justify="space-between" alignItems="flex-end" className={classes.noWrap} spacing={2}>
          <Grid item>
            {done ? <Typography>Done! We will verify it soon.</Typography> : null}
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              endIcon={loading ? <CircularProgress size={17} /> : <FlightTakeoffRounded />}
              disabled={loading || done}
              onClick={this.onSubmit}
            >
              <Typography>Submit</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  pool: state.pool,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  addPool,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SubmitPool)));