import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';
import Typography from 'senswap-ui/typography';

import Header from './header';
import StakePools from './stakePool';

import styles from './styles';


class Farms extends Component {
  constructor() {
    super();

    this.state = {
      data: [
        {
          name: ''
        }
      ]
    }
  }

  componentDidMount() {
  }
  generationTable() {

  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return <Grid container>
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        <Drain size={1} />
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="textSecondary">Farm token value</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h3">3,123,412 FT</Typography>
              <Typography variant="h5">1,1231 USD</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography>APR: 10%</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography>APY: 10%</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Drain size={1} />
      </Grid>
      <Grid item xs={12}>
        <StakePools data={data} />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Farms)));