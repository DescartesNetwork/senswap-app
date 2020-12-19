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

import { UnfoldMoreRounded } from '@material-ui/icons';

import sol from 'helpers/sol';
import styles from './styles';
import { updateSen } from 'modules/wallet.reducer';


class Address extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      senAddress: '',
      sensData: [],
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
    const { wallet: { sens } } = this.props;
    return Promise.all(sens.map(senAddress => {
      return sol.getPoolData(senAddress);
    })).then(re => {
      return this.setState({ sensData: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onAddress = (senAddress) => {
    return this.setState({ senAddress }, () => {
      this.props.onChange(senAddress);
      return this.onClose();
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  renderGroupedSensData = () => {
    const { sensData } = this.state;
    const groupedSensData = {};
    sensData.forEach(({ address, pool: { token } }) => {
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

    return render;
  }

  render() {
    const { anchorEl, senAddress } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Sen address"
          variant="outlined"
          value={senAddress}
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
  updateSen,
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