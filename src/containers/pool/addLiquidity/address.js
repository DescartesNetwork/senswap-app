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

import sol from 'helpers/sol';
import styles from './styles';


class Address extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      lptAccount: '',
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
    const { wallet: { user: { lptAccounts } } } = this.props;
    return Promise.all(lptAccounts.map(lptAccount => {
      return sol.getPoolData(lptAccount);
    })).then(re => {
      return this.setState({ data: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onAddress = (lptAccount) => {
    return this.setState({ lptAccount }, () => {
      this.props.onChange(lptAccount);
      return this.onClose();
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onAdd = () => {

  }

  renderGroupedSensData = () => {
    const { data } = this.state;
    const groupedSensData = {};
    data.forEach(({ address, pool: { token } }) => {
      const symbol = token.symbol.join('').replace('-', '');
      if (!groupedSensData[symbol]) groupedSensData[symbol] = [];
      return groupedSensData[symbol].push(address);
    });

    const render = [];
    for (let symbol in groupedSensData) {
      render.push(<ListSubheader key={symbol}>{symbol}</ListSubheader>)
      groupedSensData[symbol].forEach(address => {
        return render.push(<MenuItem key={address} onClick={() => this.onAddress(address)}>
          <Typography noWrap>{address}</Typography>
        </MenuItem>)
      });
    }
    render.push(<ListSubheader key="info">Create a new Sen address</ListSubheader>)
    render.push(<MenuItem key="button" onClick={this.onAdd}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<EmojiObjectsRounded />}
        onClick={this.onAdd}
        fullWidth
      >
        <Typography>Create</Typography>
      </Button>
    </MenuItem>)

    return render;
  }

  render() {
    const { anchorEl, lptAccount } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Sen address"
          variant="outlined"
          value={lptAccount}
          onChange={(e) => this.onAddress(e.target.value || '')}
          InputProps={{
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
          {this.renderGroupedSensData()}
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
}, dispatch);

Address.defaultProps = {
  onChange: () => { },
}

Address.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Address)));