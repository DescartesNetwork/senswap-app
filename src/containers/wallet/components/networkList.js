import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';

import { UnfoldMoreRounded } from '@material-ui/icons';

import NetworkAvatar from './networkAvatar';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getNetwork, getNetworks } from 'modules/network.reducer';
import { getNetworkData } from 'modules/bucket.reducer';


class NetworkList extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData(this.onSelect);
  }

  componentDidUpdate(prevProps) {
    const { mintAddress: prevMintAddress } = prevProps;
    const { mintAddress } = this.props;
    if (!isEqual(mintAddress, prevMintAddress)) return this.fetchData(this.onSelect);
  }

  fetchData = (callback) => {
    const { mintAddress, getNetworks, getNetwork, getNetworkData, setError } = this.props;
    return getNetworks({}, 1000, 0).then(networkIds => {
      return Promise.all(networkIds.map(({ _id }) => getNetwork(_id)));
    }).then(data => {
      if (mintAddress) data = data.filter(({ mints }) => mints.includes(mintAddress));
      return Promise.all(data.map(({ address }) => getNetworkData(address)));
    }).then(data => {
      return this.setState({ data }, callback);
    }).catch(er => {
      return this.setState({ data: [] }, () => {
        return setError(er);
      });
    });
  }

  onSelect = (networkAddress) => {
    const { onChange } = this.props;
    const { data } = this.state;
    if (!data || !data.length) return onChange({});
    return this.setState({ anchorEl: null }, () => {
      const networkData = data.filter(({ address }) => address === networkAddress)[0] || data[0];
      return onChange(networkData);
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target }, this.fetchData);
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  render() {
    const { classes } = this.props;
    const { icon, size, edge } = this.props;
    const { anchorEl, data } = this.state;

    return <Fragment>
      <Tooltip title="Network List">
        <IconButton size={size} onClick={this.onOpen} edge={edge}>
          {icon}
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.onClose}>
        {data.map(({ address, mints }) => {
          return <MenuItem key={address} onClick={() => this.onSelect(address)}>
            <Grid container spacing={1} className={classes.noWrap} alignItems="center">
              <Grid item>
                <NetworkAvatar mintAddresses={mints} />
              </Grid>
              <Grid item className={classes.stretch}>
                <Typography className={classes.address}>{address}</Typography>
              </Grid>
            </Grid>
          </MenuItem>
        })}
        {!data.length ? <ListSubheader disableSticky>No result</ListSubheader> : null}
      </Menu>
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  network: state.network,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getNetwork, getNetworks,
  getNetworkData
}, dispatch);

NetworkList.defaultProps = {
  icon: <UnfoldMoreRounded />,
  size: 'small',
  edge: false,
  mintAddress: '',
  onChange: () => { },
}

NetworkList.propTypes = {
  icon: PropTypes.object,
  size: PropTypes.string,
  edge: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  mintAddress: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NetworkList)));