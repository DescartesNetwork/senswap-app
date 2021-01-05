import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';

import { MenuRounded } from '@material-ui/icons';

import styles from '../styles';
import sol from 'helpers/sol';
import { setMainTokenAccount } from 'modules/wallet.reducer';


class TokenMenu extends Component {
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
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(wallet, prevWallet)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { tokenAccounts } } } = this.props;
    return Promise.all(tokenAccounts.map(tokenAccount => {
      return sol.getTokenData(tokenAccount);
    })).then(re => {
      return this.setState({ data: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onSelect = (tokenAccount) => {
    const { wallet: { user: { tokenAccounts } }, setMainTokenAccount } = this.props;
    return setMainTokenAccount(tokenAccount).then(re => {
      return this.onClose();
    }).catch(er => {
      return console.error(er);
    });
  }

  renderGroupedTokensData = () => {
    const { data } = this.state;
    let groupedTokensData = {};
    data.forEach(({ address, token }) => {
      const symbol = token.symbol.join('').replace('-', '');
      if (!groupedTokensData[symbol]) groupedTokensData[symbol] = [];
      groupedTokensData[symbol].push(address);
    });

    let render = [];
    for (let symbol in groupedTokensData) {
      render.push(<ListSubheader key={symbol}>{symbol}</ListSubheader>)
      groupedTokensData[symbol].forEach(address => {
        render.push(<MenuItem key={address} onClick={() => this.onSelect(address)}>
          <Typography noWrap>{address}</Typography>
        </MenuItem>)
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

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tooltip title="Token List">
          <IconButton color="secondary" size="small" onClick={this.onOpen}>
            <MenuRounded />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.onClose}
        >
          {this.renderGroupedTokensData()}
        </Menu>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setMainTokenAccount,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TokenMenu)));