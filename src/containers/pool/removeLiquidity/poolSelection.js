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
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';

import {
  CheckCircleOutlineRounded, UnfoldMoreRounded, HelpOutlineRounded,
} from '@material-ui/icons';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getMints, getMint } from 'modules/mint.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class PoolSelection extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      index: 0,
      data: [],
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
      getPools, getPool,
      getMints, getMint,
      getPoolData,
    } = this.props;
    if (!pools || !pools.length) return;

    let data = null;
    return Promise.all(pools.map(poolAddress => {
      return getPoolData(poolAddress);
    })).then(re => {
      data = re;
      const condition = { '$or': data.map(({ address }) => ({ address })) }
      return getPools(condition, 1000, 0);
    }).then(poolIds => {
      return Promise.all(poolIds.map(({ _id }) => {
        return getPool(_id);
      }));
    }).then(re => {
      data = data.map(poolData => {
        const { address: refAddress } = poolData;
        for (let each of re) {
          const { address } = each;
          if (address === refAddress) return { ...each, ...poolData }
        }
        return { ...poolData }
      });
      return Promise.all(data.map(({ mint: { address } }) => {
        return getMints({ address });
      }));
    }).then(re => {
      const mintIds = re.map(([mintId]) => (mintId || { _id: null }));
      return Promise.all(mintIds.map(({ _id }) => {
        return getMint(_id).then(data => {
          return Promise.resolve(data);
        }).catch(er => {
          return Promise.resolve({});
        });
      }));
    }).then(re => {
      data = data.map((pool, i) => {
        const newPool = { ...pool }
        newPool.mint = { ...pool.mint, ...re[i] }
        return newPool;
      });
      return this.setState({ data }, () => {
        return this.onSelect(0);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onSelect = (index) => {
    return this.setState({ index }, () => {
      const { onChange } = this.props;
      const { data } = this.state;
      if (!data.length) return;
      const { address } = data[index];
      this.onClose();
      return onChange(address);
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  renderMint = (name, icon, author, verified) => {
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
          color="primary"
          classes={{ colorPrimary: !verified ? classes.unverified : classes.verified }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
        >
          <Avatar src={icon} className={classes.icon}>
            <HelpOutlineRounded />
          </Avatar>
        </Badge>
      </Grid>
      <Grid item className={classes.stretch}>
        <Typography>{name}</Typography>
        <Typography className={classes.owner}>Created by {author || 'Unknown'}</Typography>
      </Grid>
    </Grid>
  }

  renderPools = () => {
    const { data } = this.state;
    if (!data.length) return null;
    return <MenuList>
      {data.map((pool, index) => {
        const { address, author, verified, mint: { name, icon } } = pool;
        return <MenuItem key={address} onClick={() => this.onSelect(index)}>
          {this.renderMint(name || address, icon, author, verified)}
        </MenuItem>
      })}
    </MenuList>
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, index, data } = this.state;

    const verified = data[index] && data[index].verified;
    const address = data[index] && data[index].address;
    const symbol = data[index] && data[index].mint && data[index].mint.symbol;
    const icon = data[index] && data[index].mint && data[index].mint.icon;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          value={symbol || address || 'Unknown'}
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
              <Avatar src={icon} className={classes.iconWithMarginRight}>
                <HelpOutlineRounded />
              </Avatar>
            </Badge>,
            endAdornment: <IconButton onClick={this.onOpen} edge="end">
              <UnfoldMoreRounded />
            </IconButton>,
            readOnly: true,
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
  mint: state.mint,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPools, getPool,
  getMints, getMint,
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