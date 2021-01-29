import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';

import { SendRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import styles from './styles';


class PayerTransfer extends Component {
  constructor() {
    super();

    this.state = {
      address: '',
    }
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    return this.setState({ address });
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onTransfer = () => {
    console.log('Transfer');
  }

  render() {
    const { classes } = this.props;
    const { address, amount } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Receiver'
                onChange={this.onAddress}
                value={address}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <InputBase
                placeholder='Amount'
                onChange={this.onAmount}
                value={amount}
                fullWidth
              />
            </Grid>
            <Grid item>
              <IconButton
                color="secondary"
                size="small"
                onClick={this.onTransfer}>
                <SendRounded />
              </IconButton>
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
)(withStyles(styles)(PayerTransfer)));