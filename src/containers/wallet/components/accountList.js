import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';

import { UnfoldMoreRounded, EmojiObjectsRounded } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { openWallet } from 'modules/wallet.reducer';


class AccountList extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser }, tokenAddress: prevTokenAddress } = prevProps;
    const { wallet: { user }, tokenAddress } = this.props;
    if (!isEqual(user, prevUser) || !isEqual(tokenAddress, prevTokenAddress)) this.fetchData();
  }

  fetchData = () => {
    const {
      wallet: { user: { tokenAccounts } },
      tokenAddress, onChange
    } = this.props;
    return Promise.all(tokenAccounts.map(tokenAccount => {
      return sol.getTokenData(tokenAccount);
    })).then(data => {
      if (tokenAddress && data) data = data.filter(each => {
        const { token: { address } } = each;
        return address === tokenAddress;
      });
      if (!data || !data.length) return onChange();
      return this.setState({ data }, () => {
        const { address } = data[0];
        return this.onSelect(address);
      });
    }).catch(er => {
      console.error(er);
      return onChange();
    });
  }

  onSelect = (accountAddress) => {
    const { onChange } = this.props;
    const { data } = this.state;

    const icon = utils.randEmoji(accountAddress);
    let accountData = {}
    for (let each of data) {
      const { address } = each;
      if (address === accountAddress) accountData = each;
    }
    onChange({ ...accountData, icon });
    return this.onClose();
  }

  getBalance = (accountAddress) => {
    const { data } = this.state;
    for (let each of data) {
      const { address, amount, token: { decimals } } = each;
      if (address === accountAddress)
        return utils.prettyNumber(utils.div(amount, global.BigInt(10 ** decimals)));
    }
  }

  renderGroupedTokensData = () => {
    const { classes } = this.props;
    const { data } = this.state;
    let groupedTokensData = {};
    data.forEach(({ address, token }) => {
      const symbol = sol.toSymbol(token.symbol);
      const tokenAddress = token.address.substring(0, 6);
      const key = `${symbol} - ${tokenAddress}`;
      if (!groupedTokensData[key]) groupedTokensData[key] = [];
      groupedTokensData[key].push(address);
    });

    let render = [];
    for (let key in groupedTokensData) {
      render.push(<ListSubheader key={key}>{key}</ListSubheader>)
      groupedTokensData[key].forEach(address => {
        render.push(<MenuItem key={address} onClick={() => this.onSelect(address)}>
          <Grid container spacing={1} className={classes.noWrap} alignItems="center">
            <Grid item>
              <Avatar className={classes.icon}>
                <Typography variant="h5">{utils.randEmoji(address)}</Typography>
              </Avatar>
            </Grid>
            <Grid item className={classes.stretch}>
              <Typography className={classes.address}>{address}</Typography>
              <Typography variant="body2">{this.getBalance(address)}</Typography>
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
        {this.renderGroupedTokensData()}
        <ListSubheader>Your accounts not presented here</ListSubheader>
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
});

AccountList.defaultProps = {
  icon: <UnfoldMoreRounded />,
  size: 'small',
  edge: false,
  tokenAddress: '',
  onChange: () => { },
}

AccountList.propTypes = {
  icon: PropTypes.object,
  size: PropTypes.string,
  edge: PropTypes.string,
  tokenAddress: PropTypes.string,
  onChange: PropTypes.func,
}

const mapDispatchToProps = dispatch => bindActionCreators({
  openWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AccountList)));