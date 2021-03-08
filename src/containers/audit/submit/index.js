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
import CircularProgress from '@material-ui/core/CircularProgress';

import { FlightTakeoffRounded } from '@material-ui/icons';

import Drain from 'components/drain';

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
      email: '',
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

  onAuthor = (e) => {
    const author = e.target.value || '';
    return this.setState({ author });
  }

  onSubmit = () => {
    const { poolAddress, author } = this.state;
    const { setError, addPool } = this.props;
    if (!ssjs.isAddress(poolAddress)) return setError('The pool address is invalid');
    if (!author) return setError('The author is empty');
    const pool = { address: poolAddress, author }
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
    const { poolAddress, author, loading, done } = this.state;

    return <Grid container spacing={2}>
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
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label="Author"
          value={author}
          onChange={this.onAuthor}
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