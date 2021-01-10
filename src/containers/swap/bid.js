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

import { UnfoldMoreRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { getPools, getPool } from 'modules/pool.reducer';


class Bid extends Component {
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
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(user, prevUser)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { tokenAccounts } } } = this.props;
    const { pool: { limit, page }, getPools, getPool } = this.props;
    let data = [];
    return Promise.all(tokenAccounts.map(tokenAccount => {
      return sol.getTokenData(tokenAccount);
    })).then(re => {
      const condition = { '$or': re.map(({ token }) => ({ token: token.address })) }
      return getPools(condition, limit, page + 1);
    }).then(poolIds => {
      return Promise.all(poolIds.map(({ _id }) => {
        return getPool(_id);
      }));
    }).then(re => {
      data = re;
      return Promise.all(data.map(({ cgk }) => {
        return utils.imgFromCGK(cgk);
      }));
    }).then(icons => {
      data = data.map((pool, i) => {
        pool.icon = icons[i];
        return pool;
      });
      return Promise.all(data.map(({ address }) => {
        return sol.getPurePoolData(address);
      }));
    }).then(re => {
      data = data.map((each, i) => ({ ...each, ...re[i] }));
      return this.setState({ data });
    }).catch(er => {
      return console.error(er);
    });
  }

  onIndex = (index) => {
    return this.setState({ index, poolAddress: '' }, () => {
      const { data } = this.state;
      const { address } = data[index];
      this.props.onChange(address);
      return this.onClose();
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, index, data } = this.state;

    const poolSymbol = sol.toSymbol(data[index] && data[index].token && data[index].token.symbol);
    const poolIcon = data[index] && data[index].icon;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          value={poolSymbol}
          InputProps={{
            startAdornment: <Avatar src={poolIcon} className={classes.iconWithMarginLeft} />,
            endAdornment: <IconButton color="primary" onClick={this.onOpen} edge="end" >
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
          <ListSubheader>Recommended pools</ListSubheader>
          {
            data.map((pool, index) => {
              const { address, icon, email, token: { symbol } } = pool;
              return <MenuItem key={address} onClick={() => this.onIndex(index)}>
                <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                  <Grid item>
                    <Avatar src={icon} className={classes.icon} />
                  </Grid>
                  <Grid item className={classes.stretch}>
                    <Typography>{sol.toSymbol(symbol)}</Typography>
                    <Typography className={classes.owner}>Created by {email}</Typography>
                  </Grid>
                </Grid>
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

Bid.defaultProps = {
  onChange: () => { },
}

Bid.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Bid)));