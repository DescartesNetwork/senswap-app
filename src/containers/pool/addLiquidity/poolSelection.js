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
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';

import {
  CheckCircleOutlineRounded, UnfoldMoreRounded, HelpOutlineRounded,
} from '@material-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class PoolSelection extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      index: 0,
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
      wallet: { user: { mints } },
      setError,
      getPools, getPool,
      getPoolData,
    } = this.props;
    if (!mints.length) return;

    let pools = [];
    const condition = { '$or': mints.map(mintAddress => ({ mint: mintAddress })) }
    return getPools(condition, 1000, 0).then(poolIds => {
      return Promise.all(poolIds.map(({ _id }) => {
        return getPool(_id);
      }));
    }).then(data => {
      pools = data;
      return Promise.all(pools.map(({ address }) => {
        return getPoolData(address);
      }));
    }).then(data => {
      return this.setState({ pools: data }, () => {
        return this.onSelect(0);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onSelect = (index) => {
    return this.setState({ index }, () => {
      const { pools } = this.state;
      if (!pools.length) return;
      this.onClose();
      return this.props.onChange(pools[index]);
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

  renderPools = () => {
    const { pools } = this.state;
    if (!pools.length) return null;
    return <MenuList>
      {pools.map((pool, index) => {
        const { address, verified, mint: { name, icon } } = pool;
        return <MenuItem key={address} onClick={() => this.onSelect(index)}>
          {this.renderMint(name, icon, address, verified)}
        </MenuItem>
      })}
    </MenuList>
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, index, pools } = this.state;

    const { verified, mint } = pools[index] || {};
    const { symbol, icon } = mint || {};

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          value={symbol || 'Unkown'}
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
            readOnly: true
          }}
          fullWidth
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.onClose}
        >
          {this.renderPools()}
        </Menu>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  pool: state.pool,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPools, getPool,
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