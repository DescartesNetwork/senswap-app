import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import { IconButton } from 'senswap-ui/button';
import Typography from 'senswap-ui/typography';

import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Image from 'material-ui-image';

import { MenuRounded } from 'senswap-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';
import PayerInfo from './info';
import PayerTransfer from './transfer';

import styles from './styles';
import SOL_LOGO from 'static/images/solana-logo.svg';


class Payer extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container>
      <Grid item xs={12}>
        <BaseCard className={classes.card}>
          <Grid container>
            <Grid item xs={12}>
              <Grid container alignItems="center" className={classes.noWrap}>
                <Grid item className={classes.stretch}>
                  <Typography variant="h6">Main Account</Typography>
                </Grid>
                <Grid item style={{ width: 50 }}>
                  <Image
                    src={SOL_LOGO}
                    color="#00000000"
                    loading={<CircularProgress size={17} />}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Drain />
            </Grid>
            <Grid item xs={12}>
              <PayerInfo />
            </Grid>
            <Grid item xs={12}>
              <Drain small />
            </Grid>
            <Grid item xs={12}>
              <PayerTransfer />
            </Grid>
            <Grid item xs={12}>
              <Tooltip title="Multiple accounts (Coming soon)">
                <IconButton size="small">
                  <MenuRounded />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Payer)));