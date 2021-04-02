import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';

import { UnfoldMoreRounded, EmojiObjectsRounded } from '@material-ui/icons';

import LPTAvatar from './lptAvatar';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { openWallet } from 'modules/wallet.reducer';
import { getLPTData } from 'modules/bucket.reducer';


class LPTList extends Component {
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

  componentDidUpdate(prevProps, prevState) {
    const { wallet: { lpts: prevLPTs }, poolAddress: prevPoolAddress } = prevProps;
    const { wallet: { lpts }, poolAddress } = this.props;
    const { anchorEl: prevAnchorEl } = prevState;
    const { anchorEl } = this.state;
    if (!isEqual(lpts, prevLPTs)) return this.fetchData(this.onSelect);
    if (!isEqual(poolAddress, prevPoolAddress)) return this.fetchData(this.onSelect);
    if (!isEqual(prevAnchorEl, anchorEl) && Boolean(anchorEl)) return this.fetchData();
  }

  fetchData = (callback) => {
    const { wallet: { lpts }, poolAddress, onChange, getLPTData } = this.props;
    if (!lpts.length) return onChange('');
    return Promise.all(lpts.map(lptAddress => {
      return getLPTData(lptAddress);
    })).then(data => {
      if (poolAddress) data = data.filter(({ pool: { address } }) => address === poolAddress);
      return this.setState({ data }, callback);
    }).catch(er => {
      return setError(er);
    });
  }

  onSelect = (lptAddress) => {
    const { onChange } = this.props;
    const { data } = this.state;
    if (!data || !data.length) return onChange('');
    return this.setState({ anchorEl: null }, () => {
      const address = lptAddress || data[0].address || '';
      return onChange(address);
    });
  }

  parseLPT = (lptAddress) => {
    const { data } = this.state;
    const lptData = data.find(({ address }) => address === lptAddress);
    const { lpt } = lptData;
    return utils.prettyNumber(ssjs.undecimalize(lpt, 9));
  }

  renderGroupedMintsData = () => {
    const { classes } = this.props;
    const { data } = this.state;
    let groupedMintsData = {};
    data.forEach(({ address: lptAddress, pool: { mint } }) => {
      const mintAddress = mint.address.substring(0, 6);
      const key = `${mint.symbol} - ${mintAddress}`;
      if (!groupedMintsData[key]) groupedMintsData[key] = [];
      groupedMintsData[key].push(lptAddress);
    });

    let render = [];
    for (let key in groupedMintsData) {
      render.push(<ListSubheader key={key} disableSticky>{key}</ListSubheader>)
      groupedMintsData[key].forEach(lptAddress => {
        render.push(<MenuItem key={lptAddress} onClick={() => this.onSelect(lptAddress)}>
          <Grid container spacing={1} className={classes.noWrap} alignItems="center">
            <Grid item>
              <LPTAvatar address={lptAddress} />
            </Grid>
            <Grid item className={classes.stretch}>
              <Typography className={classes.address}>{lptAddress}</Typography>
              <Typography variant="body2">{this.parseLPT(lptAddress)}</Typography>
            </Grid>
          </Grid>
        </MenuItem>);
      });
    }

    return render;
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  render() {
    const { anchorEl } = this.state;
    const { icon, size, edge, openWallet } = this.props;

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
        {this.renderGroupedMintsData()}
        <ListSubheader disableSticky>Your accounts not presented here</ListSubheader>
        <MenuItem>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EmojiObjectsRounded />}
            onClick={openWallet}
            fullWidth
          >
            <Typography>Create/Add accounts</Typography>
          </Button>
        </MenuItem>
      </Menu>
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  openWallet,
  getLPTData,
}, dispatch);

LPTList.defaultProps = {
  icon: <UnfoldMoreRounded />,
  size: 'small',
  edge: false,
  poolAddress: '',
  onChange: () => { },
}

LPTList.propTypes = {
  icon: PropTypes.object,
  size: PropTypes.string,
  edge: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  poolAddress: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LPTList)));