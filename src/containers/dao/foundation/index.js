import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { GroupRounded, ExpandMoreRounded } from '@material-ui/icons';

import GroupTokens from './groupTokens';
import FoundationAction from './action';

import styles from './styles';
import { getNetworks, getNetwork } from 'modules/network.reducer';
import { setError } from 'modules/ui.reducer';


class Foundation extends Component {
  constructor() {
    super();

    this.state = {
      address: '',
      networkAddresses: [],
      data: {},
      anchorEl: null,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { getNetworks, getNetwork, setError } = this.props;
    return getNetworks({}, 1000, 0).then(data => {
      return Promise.all(data.map(({ _id }) => {
        return getNetwork(_id);
      }));
    }).then(data => {
      const networkAddresses = data.map(({ address }) => address);
      return this.setState({ networkAddresses }, () => {
        return this.onSelect(0);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onSelect = (index) => {
    const { networkAddresses } = this.state;
    if (index >= networkAddresses.length) return;
    return this.setState({ address: networkAddresses[index] }, this.onClose);
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, networkAddresses, address } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <IconButton color="secondary">
              <GroupRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6" color="primary">Foundation</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="center">
          <Grid item>
            <IconButton size="small" color="secondary" onClick={this.onOpen}>
              <ExpandMoreRounded />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.onClose}
            >
              {networkAddresses.map((networkAddress, index) => <MenuItem key={index} onClick={() => this.onSelect(index)}>
                <Grid container spacing={1} className={classes.noWrap} alignItems="center">
                  <Grid item>
                    <GroupTokens network={networkAddress} />
                  </Grid>
                  <Grid item>
                    <Typography className={classes.subtitle}>{networkAddress}</Typography>
                  </Grid>
                </Grid>
              </MenuItem>)}
            </Menu>
          </Grid>
          <Grid item className={classes.stretch}>
            <Typography variant="body2" align="right">Network Address</Typography>
            <Typography className={classes.subtitle} align="right">{address}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <FoundationAction network={address} />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  network: state.network,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getNetworks, getNetwork,
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Foundation)));