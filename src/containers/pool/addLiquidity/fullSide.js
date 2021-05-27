import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import CircularProgress from 'senswap-ui/circularProgress';

import { } from 'senswap-ui/icons';

import Field from './field';

import styles from './styles';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class FullSide extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      index: 0,
      amounts: ['', '', ''],
      accountData: [],
    }
  }

  componentDidMount() {
    this.onChange(); // Reset state
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { poolData: prevPoolData } = prevProps;
    const { poolData } = this.props;
    if (!isEqual(prevPoolData, poolData)) this.fetchData();
  }

  fetchData = async () => {
    const {
      poolData, wallet: { user: { address: walletAddress } },
      getAccountData, setError
    } = this.props;
    const { mint_s, mint_a, mint_b } = poolData;
    let mintData = [mint_s, mint_a, mint_b];

    this.setState({ loading: true });
    try {
      let accountData = [];
      for (let mintDatum of mintData) {
        const { address: mintAddress } = mintDatum || {}
        let accountDatum = await sol.scanAccount(mintAddress, walletAddress);
        const { state, address: accountAddress } = accountDatum || {}
        if (!state) accountDatum = { address: '', amount: 0n, mint: mintDatum };
        else accountDatum = await getAccountData(accountAddress);
        accountData.push(accountDatum);
      }
      return this.setState({ accountData, loading: false });
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  onAmount = (i, value) => {
    const { amounts } = this.state;
    let newAmounts = [...amounts];
    newAmounts[i] = value;
    return this.setState({ amounts: newAmounts }, this.onChange);
  }

  onMax = (index) => {
    const { accountData, amounts } = this.state;
    const { amount, mint } = accountData[index] || {}
    const { decimals } = mint || {}
    let newAmounts = [...amounts];
    newAmounts[index] = ssjs.undecimalize(amount, decimals);
    return this.setState({ amounts: newAmounts }, this.onChange);
  }

  onChange = () => {
    const { onChange } = this.props;
    const { amounts } = this.state;
    return onChange(amounts);
  }

  render() {
    const { classes } = this.props;
    const { loading, amounts, accountData } = this.state;

    return <Grid container spacing={2} justify="center">
      {!loading ? accountData.map((data, index) => <Grid item key={index} xs={12}>
        <Field
          accountData={data}
          value={amounts[index]}
          onChange={value => this.onAmount(index, value)}
        />
      </Grid>) : <Grid item>
        <CircularProgress size={17} />
      </Grid>}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
}, dispatch);

FullSide.defaultProps = {
  poolData: {},
  onChange: () => { },
}

FullSide.propTypes = {
  poolData: PropTypes.object,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(FullSide)));