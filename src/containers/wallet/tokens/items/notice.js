import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import { WarningRounded } from '@material-ui/icons';

import sol from 'helpers/sol';
import styles from '../styles';


class OwnerNotice extends Component {
  constructor() {
    super();

    this.state = {
      tokenData: {},
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(wallet, prevWallet)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { token } } = this.props;
    return sol.getTokenData(token).then(re => {
      return this.setState({ tokenData: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { wallet: { address: payerAddress } } = this.props;
    const { tokenData: { initialized, owner } } = this.state;

    if (!initialized || owner === payerAddress) return null;

    return <Grid item>
      <Tooltip title="The token owner is unmatched to the current main account. This can lead to unexpected errors.">
        <IconButton color="primary" size="small" >
          <WarningRounded />
        </IconButton>
      </Tooltip>
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
)(withStyles(styles)(OwnerNotice)));