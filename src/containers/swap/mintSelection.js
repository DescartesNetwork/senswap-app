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
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';

import {
  CheckCircleOutlineRounded, ExpandMoreRounded, HelpOutlineRounded,
  SearchRounded
} from '@material-ui/icons';

import PoolPrice from './poolPrice';
import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getMints, getMint } from 'modules/mint.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class MintSelection extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      selected: '',
      pools: [],
      search: '',
      searched: {
        pools: [],
      },
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: { mints: prevMints } } } = prevProps;
    const { wallet: { user: { mints } } } = this.props;
    if (!isEqual(mints, prevMints)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { mints } }, setError } = this.props;
    const condition = !mints.length ? { verified: true } : { '$or': mints.map(mintAddress => ({ mint: mintAddress, verified: true })) }
    return this.fetchPools(condition, 10, 0).then(pools => {
      return this.setState({ pools }, () => {
        if (pools.length) this.onSelect(pools[0].address);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  fetchPools = (condition, limit, page) => {
    return new Promise((resolve, reject) => {
      const { getPools, getPool, getPoolData } = this.props;
      return getPools(condition, limit, page).then(poolIds => {
        return Promise.all(poolIds.map(({ _id }) => {
          return getPool(_id);
        }));
      }).then(data => {
        return Promise.all(data.map(({ address }) => {
          return getPoolData(address);
        }));
      }).then(data => {
        return resolve(data);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  onSelect = (poolAddress) => {
    const { onChange } = this.props;
    return this.setState({ selected: poolAddress }, () => {
      onChange(poolAddress);
      return this.onClose();
    });
  }

  onSearch = (e) => {
    const search = e.target.value || '';
    if (search.length > 20) return;
    return this.setState({ search }, () => {
      if (!search) return this.fetchData();
      if (search.length < 2) return this.setState({ pools: [] });
      const condition = {
        '$or': [
          { symbol: { '$regex': search, '$options': 'gi' } },
          { name: { '$regex': search, '$options': 'gi' } }
        ]
      }
      const { getMints, getMint } = this.props;
      return getMints(condition, 1000, 0).then(data => {
        return Promise.all(data.map(({ _id }) => getMint(_id)));
      }).then(mints => {
        const condition = { '$or': mints.map(({ address: mintAddress }) => ({ mint: mintAddress, verified: true })) }
        return this.fetchPools(condition, 1000, 0);
      }).then(pools => {
        return this.setState({ pools });
      }).catch(er => {
        return this.setState({ pools: [] });
      });
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
            verified ? <Tooltip title="This pool is verified by SenSwap">
              <CheckCircleOutlineRounded className={classes.badgeIcon} />
            </Tooltip> : <Tooltip title="This pool is NOT verified by SenSwap">
              <HelpOutlineRounded className={classes.badgeIcon} />
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
    const { anchorEl, selected, search } = this.state;
    const { pools } = this.state;

    const { verified, address, mint: { symbol, icon } } = pools.filter(({ address }) => (address === selected))[0] || {
      verified: false,
      address: '',
      mint: { symbol: 'Unknown', icon: '' }
    }

    return <Grid container spacing={2} alignItems="flex-end" className={classes.noWrap}>
      <Grid item className={classes.stretch}>
        <Chip
          avatar={<Avatar src={icon} className={classes.icon}>
            <HelpOutlineRounded />
          </Avatar>}
          label={symbol || address.substring(0, 4) + '...' + address.substring(address.length - 4, address.lentgh)}
          onClick={this.onOpen}
          deleteIcon={<ExpandMoreRounded />}
          onDelete={this.onOpen}
          color={verified ? 'primary' : 'secondary'}
          classes={{
            root: classes.chip,
            colorPrimary: classes.verified,
            colorSecondary: classes.unverified,
          }}
        />
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.onClose} >
          <Grid container spacing={2} className={classes.tools}>
            <Grid item xs={12}>
              <TextField
                placeholder="Symbol or Name"
                value={search}
                onChange={this.onSearch}
                InputProps={{
                  startAdornment: <IconButton edge="start" disabled>
                    <SearchRounded />
                  </IconButton>
                }}
                onKeyDown={e => e.stopPropagation()}
                fullWidth
              />
            </Grid>
          </Grid>
          {this.renderGroupedPoolsData()}
        </Menu>
      </Grid>
      <Grid item>
        <PoolPrice address={address} />
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

MintSelection.defaultProps = {
  onChange: () => { },
}

MintSelection.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MintSelection)));