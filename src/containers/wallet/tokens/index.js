import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';
import Image from 'material-ui-image';

import { ExpandLessRounded, ExpandMoreRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';
import TokenInfo from './info';
import TokenTransfer from './transfer';
import TokenSettings from './settings';

import styles from './styles';
import SEN_LOGO from 'static/images/sen-logo.svg';
import { getAccountData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';


class Tokens extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
      advance: false,
    }
  }

  componentDidMount = () => {
    this.fetchData();
  }

  componentDidUpdate = (prevProps) => {
    const { wallet: { mainAccount: prevMainAccount } } = prevProps;
    const { wallet: { mainAccount } } = this.props;
    if (!isEqual(mainAccount, prevMainAccount)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { mainAccount }, setError, getAccountData } = this.props;
    if (!ssjs.isAddress(mainAccount)) return this.setState({ data: {} });
    return getAccountData(mainAccount).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  onAdvance = () => {
    const { advance } = this.state;
    return this.setState({ advance: !advance });
  }

  render() {
    const { classes } = this.props;
    const { advance, data: { mint } } = this.state;
    const { icon } = mint || {}

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
                    src={icon || SEN_LOGO}
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
              <Collapse in={advance}>
                <Typography>Hello 😚</Typography>
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
                <Grid item className={classes.stretch}>
                  <TokenSettings />
                </Grid>
                <Grid item>
                  <Tooltip title="Advanced Functions">
                    <IconButton color="secondary" size="small" onClick={this.onAdvance}>
                      {advance ? <ExpandLessRounded /> : <ExpandMoreRounded />}
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
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getAccountData,
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Tokens)));