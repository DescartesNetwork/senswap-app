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
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';

import { EmojiObjectsRounded, UnfoldMoreRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { openWallet } from 'modules/wallet.reducer';


class LPTSelection extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      address: '',
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser }, poolAddress: prevPoolAddress } = prevProps;
    const { wallet: { user }, poolAddress } = this.props;
    if (!isEqual(user, prevUser) || !isEqual(poolAddress, prevPoolAddress)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { lptAccounts } }, poolAddress } = this.props;
    return Promise.all(lptAccounts.map(lptAccount => {
      return sol.getPoolData(lptAccount);
    })).then(re => {
      return this.setState({ data: re }, () => {
        if (!poolAddress) return this.onAddress({ target: { value: null } });
        const { data } = this.state;
        for (let value of data) {
          const { address, pool: { address: refPoolAddress } } = value;
          if (poolAddress === refPoolAddress)
            return this.onAddress({ target: { value: address } });
        }
        return this.onAddress({ target: { value: null } });
      });
    }).catch(er => {
      return console.error(er);
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    return this.setState({ address }, () => {
      this.onClose();
      return this.props.onChange(address);
    });
  }

  onSelect = (address) => {
    const pseudoEvent = { target: { value: address } }
    return this.onAddress(pseudoEvent);
  }

  renderGroupedLPTsData = () => {
    const { openWallet } = this.props;
    const { data } = this.state;
    const groupedLPTsData = {};
    data.forEach(({ address, pool: { token } }) => {
      const symbol = sol.toSymbol(token.symbol);
      if (!groupedLPTsData[symbol]) groupedLPTsData[symbol] = [];
      return groupedLPTsData[symbol].push(address);
    });

    const render = [];
    for (let symbol in groupedLPTsData) {
      render.push(<ListSubheader key={symbol}>{symbol} Pool</ListSubheader>)
      groupedLPTsData[symbol].forEach(address => {
        return render.push(<MenuItem key={address} onClick={() => this.onSelect(address)}>
          <Typography noWrap>{address}</Typography>
        </MenuItem>)
      });
    }
    render.push(<ListSubheader key="info">Create a new LPT address</ListSubheader>);
    render.push(<MenuItem key="button">
      <Button
        variant="contained"
        color="primary"
        startIcon={<EmojiObjectsRounded />}
        onClick={openWallet}
        fullWidth
      >
        <Typography>Create</Typography>
      </Button>
    </MenuItem>);

    return render;
  }

  render() {
    const { anchorEl, address } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="LPT account"
          variant="outlined"
          value={address}
          onChange={this.onAddress}
          InputProps={{
            endAdornment: <IconButton onClick={this.onOpen} edge="end" >
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
          {this.renderGroupedLPTsData()}
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
  openWallet,
}, dispatch);

LPTSelection.defaultProps = {
  poolAddress: '',
  onChange: () => { },
}

LPTSelection.propTypes = {
  poolAddress: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LPTSelection)));