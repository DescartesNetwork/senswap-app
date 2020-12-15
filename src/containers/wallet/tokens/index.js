import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';

import { AccountBalanceRounded, ExpandMoreRounded, ExpandLessRounded } from '@material-ui/icons';

import Manage from './manage';
import List from './list';
import Info from './info';
import Create from './create';
import Transfer from './transfer';

import styles from './styles';
import { updateToken } from 'modules/wallet.reducer';


class Tokens extends Component {
  constructor() {
    super();

    this.state = {
      visible: false
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
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <IconButton size="small" color="primary">
              <AccountBalanceRounded />
            </IconButton>
          </Grid>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Tokens</Typography>
          </Grid>
          <Grid item>
            <List />
          </Grid>
          <Grid item>
            <Manage />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Info />
      </Grid>
      <Grid item xs={12}>
        <Transfer />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={visible}>
          <Create />
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center" spacing={2}>
          <Grid item>
            <Button startIcon={visible ? <ExpandLessRounded /> : <ExpandMoreRounded />} onClick={this.onAdvanced}>
              <Typography>{visible ? 'Less' : 'Advanced'}</Typography>
            </Button>
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
  updateToken
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Tokens)));