import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import { EmojiEventsRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';


class Payer extends Component {
  constructor() {
    super();

    this.state = {
      balance: 0,
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
    const { wallet: { address } } = this.props;
    return sol.getBalance(address).then(re => {
      return this.setState({ balance: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { address } } = this.props;
    const { balance } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <IconButton size="small" color="primary">
              <EmojiEventsRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6">Main Account</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Address"
              variant="outlined"
              color="primary"
              value={address}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="SOL"
              variant="outlined"
              color="primary"
              value={balance}
              fullWidth
            />
          </Grid>
        </Grid>
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