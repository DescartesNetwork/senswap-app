import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Image from 'material-ui-image';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';
import TokenInfo from './info';
import TokenTransfer from './transfer';
import TokenSettings from './settings';

import styles from './styles';
import SEN_LOGO from 'static/images/sen-logo.svg';


class Tokens extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }
  }

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <BaseCard className={classes.card}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
                <Grid item className={classes.stretch}>
                  <Typography variant="h6">Tokens</Typography>
                </Grid>
                <Grid item style={{ width: 50 }}>
                  <Image
                    src={SEN_LOGO}
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
              <TokenInfo />
            </Grid>
            <Grid item xs={12}>
              <Drain small />
            </Grid>
            <Grid item xs={12}>
              <TokenTransfer />
            </Grid>
            <Grid item xs={12}>
              <TokenSettings />
            </Grid>
          </Grid>
        </BaseCard>
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
)(withStyles(styles)(Tokens)));