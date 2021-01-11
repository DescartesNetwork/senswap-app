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

import { UnfoldMoreRounded, HelpOutlineRounded, SearchRounded } from '@material-ui/icons';

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
        limit: 5,
        page: -1
      },
      other: {
        pools: [],
        limit: 5,
        page: -1
      },
      search: ''
    }
  }

  componentDidMount() {
    this.fetchRecommededPools();
    this.fetchOtherPools();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(user, prevUser)) {
      this.fetchRecommededPools();
      this.fetchOtherPools();
    }
  }

  fetchPools = (type, limit, page) => {
    return new Promise((resolve, reject) => {
      const { wallet: { user: { tokenAccounts } } } = this.props;
      const { getPools, getPool } = this.props;
      let pools = [];
      return Promise.all(tokenAccounts.map(tokenAccount => {
        return sol.getTokenData(tokenAccount);
      })).then(tokens => {
        const recommendedCondition = { '$or': tokens.map(({ token: { address } }) => ({ token: address })) }
        const otherCondition = { '$and': tokens.map(({ token: { address } }) => ({ token: { '$ne': address } })) }
        const condition = type === 'recommended' ? recommendedCondition : otherCondition;
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
      return this.setState({ recommended: { pools, limit, page: page + 1 } });
    }).catch(er => {
      return console.error(er);
    });
  }

  fetchOtherPools = () => {
    const { other: { limit, page } } = this.state;
    return this.fetchPools('other', limit, page + 1).then(pools => {
      if (!pools.length) return console.log('Empty tokens');
      return this.setState({ other: { pools, limit, page: page + 1 } });
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
    const symbol = e.target.value || '';
    if (symbol.length > 4) return;
    const search = symbol.toUpperCase();
    return this.setState({ search });
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
          badgeContent={!verified ? '?' : '✓'}
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

  render() {
    const { classes } = this.props;
    const {
      anchorEl, index, type, search,
      recommended: { pools: recommendedPools },
      other: { pools: otherPools }
    } = this.state;
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
            endAdornment: <IconButton color="primary" onClick={this.onOpen} edge="end">
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
                color="secondary"
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
          <ListSubheader>Recommended pools</ListSubheader>
          {!recommendedPools.length ? <MenuItem>
            <Typography>😱 Opps, it's empty now!</Typography>
          </MenuItem> : null}
          {
            recommendedPools.map((pool, index) => {
              const { address, email, verified, token: { symbol, icon } } = pool;
              return <MenuItem key={address} onClick={() => this.onSelect('recommended', index)}>
                {this.renderToken(symbol, icon, email, verified)}
              </MenuItem>
            })
          }
          <ListSubheader>Other pools</ListSubheader>
          {!otherPools.length ? <MenuItem>
            <Typography>😱 Opps, it's empty now!</Typography>
          </MenuItem> : null}
          {
            otherPools.map((pool, index) => {
              const { address, email, verified, token: { symbol, icon } } = pool;
              return <MenuItem key={address} onClick={() => this.onSelect('other', index)}>
                {this.renderToken(symbol, icon, email, verified)}
              </MenuItem>
            })
          }
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