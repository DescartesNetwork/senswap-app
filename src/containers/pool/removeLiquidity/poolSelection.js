import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';

import {
  CheckCircleOutlineRounded, UnfoldMoreRounded, HelpOutlineRounded,
} from '@material-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class PoolSelection extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      selected: '',
      pools: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser }, bucket: prevBucket } = prevProps;
    const { wallet: { user }, bucket } = this.props;
    if (!isEqual(user, prevUser)) return this.fetchData();
    if (!isEqual(bucket, prevBucket)) return this.fetchData();
  }

  fetchData = () => {
    const {
      wallet: { user: { pools } },
      setError,
      getPoolData,
    } = this.props;
    if (!pools || !pools.length) return;

    return Promise.all(pools.map(poolAddress => {
      return getPoolData(poolAddress);
    })).then(data => {
      return this.setState({ pools: data }, () => {
        return this.onSelect(data[0].address);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onSelect = (poolAddress) => {
    const { onChange } = this.props;
    return this.setState({ selected: poolAddress }, () => {
      onChange(poolAddress);
      return this.onClose();
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  renderMint = (name, icon, address, verified) => {
    const { classes } = this.props;
    return <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
      <Grid item>
        <Badge
          badgeContent={
            !verified ? <Tooltip title="This pool is NOT verified by SenSwap">
              <HelpOutlineRounded className={classes.badgeIcon} />
            </Tooltip> : <Tooltip title="This pool is verified by SenSwap">
              <CheckCircleOutlineRounded className={classes.badgeIcon} />
            </Tooltip>
          }
          overlap="circle"
          color={verified ? 'primary' : 'secondary'}
          classes={{ badge: classes.badge, colorPrimary: classes.verified, colorSecondary: classes.unverified }}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MintAvatar icon={icon} />
        </Badge>
      </Grid>
      <Grid item className={classes.stretch}>
        <Typography variant="body2">{name}</Typography>
        <Typography className={classes.subtitle}>{address}</Typography>
      </Grid>
    </Grid>
  }

  renderGroupedPoolsData = () => {
    const { pools } = this.state;
    if (!pools.length) return <ListSubheader disableSticky>No data</ListSubheader>

    let groupedPoolsData = {};
    pools.forEach(({ address, verified, network, mint }) => {
      const networkAddress = network.address.substring(0, 6);
      const key = `Network: ${networkAddress}`;
      if (!groupedPoolsData[key]) groupedPoolsData[key] = [];
      groupedPoolsData[key].push({ address, verified, mint });
    });

    let render = [];
    for (let key in groupedPoolsData) {
      render.push(<ListSubheader key={key} disableSticky>{key}</ListSubheader>)
      groupedPoolsData[key].forEach(({ address, verified, mint: { name, icon } }) => {
        render.push(<MenuItem key={address} onClick={() => this.onSelect(address)}>
          {this.renderMint(name || 'Unknown', icon, address, verified)}
        </MenuItem>);
      });
    }

    return render;
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, selected, pools } = this.state;

    const { verified, mint: { symbol, icon } } = pools.filter(({ address }) => (address === selected))[0] || {
      verified: false,
      mint: { symbol: 'Unknown', icon: '' }
    }

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          value={symbol}
          onClick={this.onOpen}
          InputProps={{
            startAdornment: <Badge
              variant="dot"
              color="primary"
              classes={{ colorPrimary: !verified ? classes.unverified : classes.verified }}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
            >
              <MintAvatar icon={icon} marginRight />
            </Badge>,
            endAdornment: <IconButton onClick={this.onOpen} edge="end">
              <UnfoldMoreRounded />
            </IconButton>,
            readOnly: true,
          }}
          fullWidth
        />
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.onClose}>
          {this.renderGroupedPoolsData()}
        </Menu>
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
  setError,
  getPoolData,
}, dispatch);

PoolSelection.defaultProps = {
  onChange: () => { },
}

PoolSelection.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PoolSelection)));