import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { PageviewRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard , NotiCard} from 'components/cards';
import NewPool from './newPool';
import AddLiquidity from './addLiquidity';
import WithdrawLiquidity from './withdrawLiquidity';

import styles from './styles';


class Pool extends Component {
  render() {
    // const { classes } = this.props;
    const { location: { pathname } } = this.props;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <NotiCard
              title="Liquidity provider incentive"
              description="Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity."
              source=""
            />
          </Grid>
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <Button
                  variant={pathname === '/pool/new-pool' ? "contained" : "outlined"}
                  color="primary"
                  component={RouterLink}
                  to={'/pool/new-pool'}
                  fullWidth
                >
                  <Typography align="center">New pool</Typography>
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant={pathname === '/pool/add-liquidity' ? "contained" : "outlined"}
                  color="primary"
                  component={RouterLink}
                  to={'/pool/add-liquidity'}
                  fullWidth
                >
                  <Typography align="center">Add liquidity</Typography>
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant={pathname === '/pool/withdraw-liquidity' ? "contained" : "outlined"}
                  color="primary"
                  component={RouterLink}
                  to={'/pool/withdraw-liquidity'}
                  fullWidth
                >
                  <Typography align="center">Withdraw liquidity</Typography>
                </Button>
              </Grid>
              <Grid item xs={12}>
                <BaseCard >
                  <Switch>
                    <Redirect exact from="/pool" to="/pool/new-pool" />
                    <Route exact path='/pool/new-pool' component={NewPool} />
                    <Route exact path='/pool/add-liquidity' component={AddLiquidity} />
                    <Route exact path='/pool/withdraw-liquidity' component={WithdrawLiquidity} />
                  </Switch>
                </BaseCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
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
)(withStyles(styles)(Pool)));