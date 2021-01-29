import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import Avatar from '@material-ui/core/Avatar';

import { UnfoldMoreRounded } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import sol from 'helpers/sol';


class AccountSelection extends Component {
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
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(user, prevUser)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { tokenAccounts } } } = this.props;
    console.log(tokenAccounts)
    return Promise.all(tokenAccounts.map(tokenAccount => {
      console.log(tokenAccount)
      return sol.getTokenData(tokenAccount);
    })).then(data => {
      return this.setState({ data }, () => {
        console.log(data)
        return this.onSelect(tokenAccounts[0].address);
      });
    }).catch(er => {
      return console.error(er);
    });
  }

  onSelect = (accountAddress) => {
    console.log(accountAddress)
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
      if (!groupedTokensData[symbol]) groupedTokensData[symbol] = [];
      groupedTokensData[symbol].push(address);
    });

    let render = [];
    for (let symbol in groupedTokensData) {
      render.push(<ListSubheader key={symbol}>{symbol}</ListSubheader>)
      groupedTokensData[symbol].forEach(address => {
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
    const { icon, size } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tooltip title="Token List">
          <IconButton color="secondary" size={size} onClick={this.onOpen}>
            {icon}
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

AccountSelection.defaultProps = {
  icon: <UnfoldMoreRounded />,
  size: 'small',
  tokenAddress: '',
  onChange: () => { },
}

AccountSelection.propTypes = {
  icon: PropTypes.object,
  size: PropTypes.string,
  tokenAddress: PropTypes.string,
  onChange: PropTypes.func,
}

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AccountSelection)));