import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import numeral from 'numeral';
import { Skeleton } from '@material-ui/lab';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import Drain from 'senswap-ui/drain';
import TextField from 'senswap-ui/textField';
import Button from 'senswap-ui/button';

import styles from './styles';

const FARMING = {
  FToken: '20,2902',
  APR: '10%',
  APY: '80%',
  reward: 1.24,
  staked: 5.22
}

class Farming extends Component {
  constructor() {
    super();

    this.state = {
    }
  }

  componentDidMount() {
  }
  render() {
    const { classes } = this.props;
    // const { isLoading, chartData: data, info, labels } = this.state;

    // if (isLoading) return <Skeleton variant="rect" height={320} className={classes.chart} />;

    return <Paper className={classes.paper}>
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Farming</Typography>
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <Typography color="textSecondary">Your FToken</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h3">
              {FARMING.FToken}
              <span style={{ fontSize: 20 }}>FT</span>
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography color="textSecondary">Annual Percentage</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">APR: {FARMING.APR}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">APY: {FARMING.APY}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12}>
          <Typography color="textSecondary">Pending reward</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2">Reward: {FARMING.reward} SEN</Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            variant="contained"
            defaultValue="0"
            InputProps={{
              endAdornment: <Typography color="error" style={{ cursor: 'pointer' }}>
                <strong>MAX</strong>
              </Typography>
            }} />
        </Grid>
        <Grid item xs={4} align="end">
          <Button
            variant="contained"
            color="primary"
          >
            Harvest
            </Button>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12}>
          <Typography color="textSecondary">Start farming</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2">Your staked: {FARMING.staked} FT</Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            variant="contained"
            defaultValue="0"
            InputProps={{
              endAdornment: <Typography color="error" style={{ cursor: 'pointer' }}>
                <strong>MAX</strong>
              </Typography>
            }} />
        </Grid>
        <Grid item xs={4} align="end">
          <Button color="secondary">UnStake</Button>
          <Button
            variant="contained"
            color="primary"
          >
            Stake
            </Button>
        </Grid>
      </Grid>
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Farming)));