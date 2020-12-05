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
import { BaseCard } from 'components/cards';
import NewPool from './newPool';
import AddLiquidity from './addLiquidity';

import styles from './styles';
import liquid1 from 'static/images/liquid1.jpg';


class Pool extends Component {
  render() {
    const { classes } = this.props;
    const { location: { pathname } } = this.props;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={10}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="center" spacing={2}>
              <Grid item xs={12} md={6} style={{ backgroundImage: `url('${liquid1}')` }} className={classes.gallery}>
                <BaseCard variant="fluent">
                  <Grid container spacing={2} justify="flex-end">
                    <Grid item xs={12}>
                      <Typography variant="body2">Liquidity provider incentive</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</Typography>
                    </Grid>
                    <Grid item>
                      <Button startIcon={<PageviewRounded />}>
                        <Typography>Learn more</Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </BaseCard>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12}>
            <Grid container justify="center" spacing={2}>
              <Grid item xs={6} md={3}>
                <Button
                  variant={pathname === '/pool/new-pool' ? "contained" : "outlined"}
                  color="primary"
                  size="large"
                  component={RouterLink}
                  to={'/pool/new-pool'}
                  fullWidth
                >
                  <Typography>New pool</Typography>
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant={pathname === '/pool/add-liquidity' ? "contained" : "outlined"}
                  color="primary"
                  size="large"
                  component={RouterLink}
                  to={'/pool/add-liquidity'}
                  fullWidth
                >
                  <Typography>Add liquidity</Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container justify="center" spacing={2}>
              <Grid item xs={12} md={6}>
                <BaseCard >
                  <Switch>
                    <Redirect exact from="/pool" to="/pool/new-pool" />
                    <Route exact path='/pool/new-pool' component={NewPool} />
                    <Route exact path='/pool/add-liquidity' component={AddLiquidity} />
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