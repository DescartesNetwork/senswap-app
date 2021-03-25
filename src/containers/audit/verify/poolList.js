import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Badge from '@material-ui/core/Badge';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  CheckCircleOutlineRounded, UnfoldMoreRounded, SearchRounded,
  HelpOutlineRounded,
} from '@material-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPool, getPools } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
}

class PoolList extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      search: '',
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData(this.onSelect);
  }

  fetchData = (callback) => {
    const { getPool, getPools, getPoolData, setError } = this.props;
    const { search } = this.state;
    let condition = { verified: false }
    if (search) condition = { address: search }
    return this.setState({ loading: true }, () => {
      return getPools(condition, 5, 0).then(poolIds => {
        return Promise.all(poolIds.map(({ _id }) => getPool(_id)));
      }).then(data => {
        return Promise.all(data.map(({ address }) => getPoolData(address)));
      }).then(data => {
        return this.setState({ ...EMPTY, data }, callback);
      }).catch(er => {
        return this.setState({ ...EMPTY, data: [] }, () => {
          return setError(er);
        });
      });
    });
  }

  onSelect = (poolAddress) => {
    const { onChange } = this.props;
    const { data } = this.state;
    let poolData = {}
    if (!data || !data.length) return onChange(poolData);
    return this.setState({ anchorEl: null }, () => {
      poolData = data.filter(({ address }) => address === poolAddress)[0] || data[0];
      return onChange(poolData);
    });
  }

  onSearch = (e) => {
    const search = e.target.value || '';
    return this.setState({ search }, this.fetchData);
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target }, this.fetchData());
  }

  onClose = () => {
    return this.setState({ anchorEl: null, search: '' });
  }

  render() {
    const { classes } = this.props;
    const { icon, size, edge } = this.props;
    const { anchorEl, data, search, loading } = this.state;

    return <Fragment>
      <Tooltip title="Token List">
        <IconButton color="secondary" size={size} onClick={this.onOpen} edge={edge}>
          {icon}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={this.onClose}
      >
        <Grid container spacing={2} className={classes.tools}>
          <Grid item xs={12}>
            <TextField
              placeholder="Name or Symbol"
              value={search}
              onChange={this.onSearch}
              InputProps={{
                startAdornment: <IconButton edge="start" disabled>
                  <SearchRounded />
                </IconButton>,
                endAdornment: loading ? <IconButton edge="end" disabled>
                  <CircularProgress size={17} />
                </IconButton> : null
              }}
              onKeyDown={e => e.stopPropagation()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} />
        </Grid>
        {data.map(({ address, verified, mint: { icon, name } }) => {
          return <MenuItem key={address} onClick={() => this.onSelect(address)}>
            <Grid container spacing={1} className={classes.noWrap} alignItems="center">
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
          </MenuItem>
        })}
        {!data.length ? <ListSubheader disableSticky>No result</ListSubheader> : null}
      </Menu>
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  pool: state.pool,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPool, getPools,
  getPoolData,
}, dispatch);

PoolList.defaultProps = {
  icon: <UnfoldMoreRounded />,
  size: 'small',
  edge: false,
  onChange: () => { },
}

PoolList.propTypes = {
  icon: PropTypes.object,
  size: PropTypes.string,
  edge: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PoolList)));