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
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { getPools, getPool } from 'modules/pool.reducer';


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
    this.fetchPools();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(user, prevUser)) this.fetchPools();
  }

  fetchPools = () => {
    const {
      wallet: { user: { lptAccounts } },
      getPools, getPool,
    } = this.props;
    let pools = [];
    return Promise.all(lptAccounts.map(lptAccount => {
      return sol.getPoolData(lptAccount);
    })).then(data => {
      pools = data.map(({ pool }) => pool);
      const condition = { '$or': pools.map(({ address }) => ({ address })) }
      return getPools(condition, 1000, 0);
    }).then(poolIds => {
      return Promise.all(poolIds.map(({ _id }) => {
        return getPool(_id);
      }));
    }).then(data => {
      pools = pools.map(pool => {
        const { address: refAddress } = pool;
        for (let each of data) {
          const { address } = each;
          if (address === refAddress) return { ...each, ...pool }
        }
        return { ...pool }
      });
      return Promise.all(pools.map(({ cgk }) => {
        return utils.imgFromCGK(cgk);
      }));
    }).then(icons => {
      pools = pools.map((pool, i) => {
        pool.token.icon = icons[i];
        return pool;
      });
      return this.setState({ pools }, () => {
        return this.onSelect(0);
      });
    }).catch(er => {
      return console.error(er);
    });
  }

  onSelect = (index) => {
    return this.setState({ index }, () => {
      const { pools } = this.state;
      if (!pools.length) return;
      const { address } = pools[index];
      this.onClose();
      return this.props.onChange(address);
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  renderToken = (symbol, icon, email, verified) => {
    const { classes } = this.props;
    return <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
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
        <Typography>{sol.toSymbol(symbol)}</Typography>
        <Typography className={classes.owner}>Created by {email || 'Unknown'}</Typography>
      </Grid>
    </Grid>
  }

  renderPools = () => {
    const { pools } = this.state;
    if (!pools.length) return null;
    return <MenuList>
      {
        pools.map((pool, index) => {
          const { address, email, verified, token: { symbol, icon } } = pool;
          return <MenuItem key={address} onClick={() => this.onSelect(index)}>
            {this.renderToken(symbol, icon, email, verified)}
          </MenuItem>
        })
      }
    </MenuList>
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, index, pools } = this.state;

    const verified = pools[index] && pools[index].verified;
    const symbol = pools[index] && pools[index].token && pools[index].token.symbol;
    const icon = pools[index] && pools[index].token && pools[index].token.icon;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          value={sol.toSymbol(symbol)}
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
              <Avatar src={icon} className={classes.iconWithMarginLeft}>
                <HelpOutlineRounded />
              </Avatar>
            </Badge>,
            endAdornment: <IconButton onClick={this.onOpen} edge="end">
              <UnfoldMoreRounded />
            </IconButton>
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
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getPools, getPool,
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