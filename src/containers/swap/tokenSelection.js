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
import MenuList from '@material-ui/core/MenuList';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';

import {
  CheckCircleOutlineRounded,
  UnfoldMoreRounded, HelpOutlineRounded, SearchRounded
} from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { getPools, getPool } from 'modules/pool.reducer';


class TokenSelection extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      type: 'recommended',
      index: 0,
      recommended: {
        pools: [],
        limit: 3,
        page: -1
      },
      new: {
        pools: [],
        limit: 3,
        page: -1
      },
      search: '',
      searched: {
        pools: [],
      },
    }
  }

  componentDidMount() {
    this.fetchRecommededPools();
    this.fetchNewPools();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(user, prevUser)) {
      this.fetchRecommededPools();
      this.fetchNewPools();
    }
  }

  fetchPools = (typeOrCondition, limit, page) => {
    return new Promise((resolve, reject) => {
      const { wallet: { user: { tokenAccounts } } } = this.props;
      const { getPools, getPool } = this.props;
      let pools = [];
      return Promise.all(tokenAccounts.map(tokenAccount => {
        return sol.getTokenData(tokenAccount);
      })).then(tokens => {
        const recommendedCondition = { '$or': tokens.map(({ token: { address } }) => ({ token: address })) }
        const newCondition = !tokens.length ? {} : { '$and': tokens.map(({ token: { address } }) => ({ token: { '$ne': address } })) }
        let condition = typeOrCondition;
        if (typeOrCondition === 'recommended') condition = recommendedCondition;
        if (typeOrCondition === 'new') condition = newCondition;
        return getPools(condition, limit, page);
      }).then(poolIds => {
        return Promise.all(poolIds.map(({ _id }) => {
          return getPool(_id);
        }));
      }).then(data => {
        pools = data;
        return Promise.all(pools.map(({ address }) => {
          return sol.getPurePoolData(address);
        }));
      }).then(data => {
        pools = pools.map((pool, i) => ({ ...pool, ...data[i] }));
        return Promise.all(pools.map(({ cgk }) => {
          return utils.imgFromCGK(cgk);
        }));
      }).then(icons => {
        pools = pools.map((pool, i) => {
          pool.token.icon = icons[i];
          return pool;
        });
        return resolve(pools);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  fetchRecommededPools = () => {
    const { recommended: { limit, page } } = this.state;
    return this.fetchPools('recommended', limit, page + 1).then(pools => {
      if (!pools.length) return console.log('Empty tokens');
      return this.setState({ recommended: { pools, limit, page: page + 1 } }, () => {
        return this.onSelect('recommended', 0);
      });
    }).catch(er => {
      return console.error(er);
    });
  }

  fetchNewPools = () => {
    const { new: { limit, page } } = this.state;
    return this.fetchPools('new', limit, page + 1).then(pools => {
      if (!pools.length) return console.log('Empty tokens');
      return this.setState({ new: { pools, limit, page: page + 1 } });
    }).catch(er => {
      return console.error(er);
    });
  }

  onSelect = (type, index) => {
    return this.setState({ type, index }, () => {
      const { [type]: { pools } } = this.state;
      const { address } = pools[index];
      this.props.onChange(address);
      return this.onClose();
    });
  }

  onSearch = (e) => {
    const search = e.target.value || '';
    if (search.length > 4) return;
    return this.setState({ search }, () => {
      const { search: value } = this.state;
      if (value.length < 2) return this.setState({ searched: { pools: [] } });
      const condition = { symbol: { '$regex': value, '$options': 'gi' } }
      return this.fetchPools(condition, 50, 0).then(pools => {
        return this.setState({ searched: { pools } });
      }).catch(er => {
        return this.setState({ searched: { pools: [] } });
      });
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
        <Typography className={classes.owner}>Created by {email}</Typography>
      </Grid>
    </Grid>
  }

  renderRecommendedPools = () => {
    const { recommended: { pools }, search } = this.state;
    if (!pools.length || search) return null;
    return <MenuList>
      <ListSubheader>Recommended pools</ListSubheader>
      {
        pools.map((pool, index) => {
          const { address, email, verified, token: { symbol, icon } } = pool;
          return <MenuItem key={address} onClick={() => this.onSelect('recommended', index)}>
            {this.renderToken(symbol, icon, email, verified)}
          </MenuItem>
        })
      }
    </MenuList>
  }

  renderNewPools = () => {
    const { new: { pools }, search } = this.state;
    if (!pools.length || search) return null;
    return <MenuList>
      <ListSubheader>New pools</ListSubheader>
      {
        pools.map((pool, index) => {
          const { address, email, verified, token: { symbol, icon } } = pool;
          return <MenuItem key={address} onClick={() => this.onSelect('new', index)}>
            {this.renderToken(symbol, icon, email, verified)}
          </MenuItem>
        })
      }
    </MenuList>
  }

  renderSearchedPools = () => {
    const { search, searched: { pools } } = this.state;
    if (!pools.length) {
      if (!search) return null;
      return <ListSubheader>No result</ListSubheader>
    }
    return <MenuList>
      <ListSubheader>Search</ListSubheader>
      {
        pools.map((pool, index) => {
          const { address, email, verified, token: { symbol, icon } } = pool;
          return <MenuItem key={address} onClick={() => this.onSelect('searched', index)}>
            {this.renderToken(symbol, icon, email, verified)}
          </MenuItem>
        })
      }
    </MenuList>
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, index, type, search } = this.state;
    const { [type]: { pools } } = this.state;

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
          <Grid container spacing={2} className={classes.tools}>
            <Grid item xs={12}>
              <TextField
                placeholder="Symbol"
                value={search}
                onChange={this.onSearch}
                InputProps={{
                  startAdornment: <IconButton edge="start" disabled>
                    <SearchRounded />
                  </IconButton>
                }}
                fullWidth
              />
            </Grid>
          </Grid>
          {this.renderSearchedPools()}
          {this.renderRecommendedPools()}
          {this.renderNewPools()}
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

TokenSelection.defaultProps = {
  onChange: () => { },
}

TokenSelection.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TokenSelection)));