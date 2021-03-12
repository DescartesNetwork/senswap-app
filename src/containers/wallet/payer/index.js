import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';
import Image from 'material-ui-image';

import { ExpandLessRounded, ExpandMoreRounded, MenuRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';
import PayerInfo from './info';
import PayerTransfer from './transfer';

import styles from './styles';
import SOL_LOGO from 'static/images/solana-logo.svg';


class Payer extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
    }
  }

  onAdvanced = () => {
    const { visible } = this.state;
    return this.setState({ visible: !visible });
  }

  render() {
    const { classes } = this.props;
    const { visible } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <BaseCard className={classes.card}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
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
              <Collapse in={visible}>
                <Typography>🎁 Hooray! An easter egg.</Typography>
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
                <Grid item className={classes.stretch}>
                  <Tooltip title="Account List">
                    <IconButton color="secondary" size="small" onClick={this.onOpen}>
                      <MenuRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Advanced Functions">
                    <IconButton color="secondary" size="small" onClick={this.onAdvanced}>
                      {visible ? <ExpandLessRounded /> : <ExpandMoreRounded />}
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
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