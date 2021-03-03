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

import AccountAvatar from './accountAvatar';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { openWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class AccountList extends Component {
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
    const { wallet: { accounts: prevAccounts }, mintAddress: prevMintAddress } = prevProps;
    const { wallet: { accounts }, mintAddress } = this.props;
    const { anchorEl: prevAnchorEl } = prevState;
    const { anchorEl } = this.state;
    if (!isEqual(mintAddress, prevMintAddress)) return this.fetchData(this.onSelect);
    if (!isEqual(accounts, prevAccounts)) return this.fetchData(this.onSelect);
    if (!isEqual(prevAnchorEl, anchorEl) && Boolean(anchorEl)) return this.fetchData();
  }

  fetchData = (callback) => {
    const {
      wallet: { accounts },
      getAccountData,
      mintAddress, onChange,
    } = this.props;
    if (!accounts || !accounts.length) return onChange('');

    return Promise.all(accounts.map(accountAddress => {
      return getAccountData(accountAddress);
    })).then(data => {
      if (mintAddress) data = data.filter(accountData => {
        const { mint: { address } } = accountData;
        return address === mintAddress;
      });
      return this.setState({ data }, callback);
    }).catch(er => {
      return setError(er);
    });
  }

  onSelect = (accountAddress) => {
    const { onChange } = this.props;
    const { data } = this.state;
    if (!data || !data.length) return onChange('');
    return this.setState({ anchorEl: null }, () => {
      const address = accountAddress || data[0].address || '';
      return onChange(address);
    });
  }

  parseBalance = (accountAddress) => {
    const { data } = this.state;
    const accountData = data.find(({ address }) => address === accountAddress);
    const { amount, mint: { decimals } } = accountData;
    return utils.prettyNumber(utils.div(amount, global.BigInt(10 ** decimals)));
  }

  renderGroupedMintsData = () => {
    const { classes } = this.props;
    const { data } = this.state;
    let groupedMintsData = {};
    data.forEach(({ address: accountAddress, mint }) => {
      const symbol = ssjs.toSymbol(mint.symbol);
      const mintAddress = mint.address.substring(0, 6);
      const key = `${symbol} - ${mintAddress}`;
      if (!groupedMintsData[key]) groupedMintsData[key] = [];
      groupedMintsData[key].push(accountAddress);
    });

    let render = [];
    for (let key in groupedMintsData) {
      render.push(<ListSubheader key={key} disableSticky>{key}</ListSubheader>)
      groupedMintsData[key].forEach(accountAddress => {
        render.push(<MenuItem key={accountAddress} onClick={() => this.onSelect(accountAddress)}>
          <Grid container spacing={1} className={classes.noWrap} alignItems="center">
            <Grid item>
              <AccountAvatar address={accountAddress} />
            </Grid>
            <Grid item className={classes.stretch}>
              <Typography className={classes.address}>{accountAddress}</Typography>
              <Typography variant="body2">{this.parseBalance(accountAddress)}</Typography>
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
  getAccountData,
}, dispatch);

AccountList.defaultProps = {
  icon: <UnfoldMoreRounded />,
  size: 'small',
  edge: false,
  mintAddress: '',
  onChange: () => { },
}

AccountList.propTypes = {
  icon: PropTypes.object,
  size: PropTypes.string,
  edge: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  mintAddress: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AccountList)));