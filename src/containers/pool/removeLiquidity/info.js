import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import utils from 'helpers/utils';
import sol from 'helpers/sol';
import styles from './styles';


class Info extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { lptAccount: prevLptAccount } = prevProps;
    const { lptAccount } = this.props;
    if (!isEqual(lptAccount, prevLptAccount)) this.fetchData();
  }

  fetchData = () => {
    const { lptAccount } = this.props;
    if (!sol.isAddress(lptAccount)) return;
    return sol.getPoolData(lptAccount).then(re => {
      return this.setState({ data: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { data: { initialized } } = this.state;
    if (!initialized) return null;
    const {
      data: {
        sen: amount,
        pool: {
          address: poolAddress,
          reserve: poolReserve,
          sen: poolSen,
          token
        },
      }
    } = this.state;
    const symbol = sol.toSymbol(token.symbol);
    const sen = utils.prettyNumber(utils.div(amount, global.BigInt(10 ** token.decimals)));
    const reserve = utils.prettyNumber(utils.div(poolReserve, global.BigInt(10 ** token.decimals)));
    const price = utils.div(poolSen, poolReserve);

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={`${symbol} Pool`}
          variant="outlined"
          value={poolAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Your current SEN"
          variant="outlined"
          value={sen}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Pool Reserve"
          variant="outlined"
          value={reserve}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label={`${symbol} Price`}
          variant="outlined"
          value={price}
          fullWidth
        />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Info.defaultProps = {
  lptAccount: '',
}

Info.propTypes = {
  lptAccount: PropTypes.string,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));