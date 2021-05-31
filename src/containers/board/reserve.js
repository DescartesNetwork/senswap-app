import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';
import numeral from 'numeral';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';

import Chart from 'components/chart';

import styles from './styles';


class Reserve extends Component {
  constructor() {
    super();

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { poolData: prevPoolData } = prevProps;
    const { poolData } = this.props;
    if (!isEqual(prevPoolData, poolData)) this.fetchData();
  }

  fetchData = async () => {
    const { poolData } = this.props;
    const { address, mint_a, mint_b, mint_s, reserve_a, reserve_b, reserve_s } = poolData;
    if (!ssjs.isAddress(address)) return this.setState({ data: [] });
    const { symbol: symbolA, decimals: decimalsA, ticket: ticketA } = mint_a || {};
    const { symbol: symbolB, decimals: decimalsB, ticket: ticketB } = mint_b || {};
    const { symbol: symbolS, decimals: decimalsS, ticket: ticketS } = mint_s || {};
    const reserveA = ssjs.undecimalize(reserve_a, decimalsA);
    const reserveB = ssjs.undecimalize(reserve_b, decimalsB);
    const reserveS = ssjs.undecimalize(reserve_s, decimalsS);
    let data = [
      [ticketA, reserveA, symbolA],
      [ticketB, reserveB, symbolB],
      [ticketS, reserveS, symbolS]
    ];
    data = await Promise.all(data.map(async ([ticket, reserve, symbol]) => {
      const { price } = await ssjs.parseCGK(ticket);
      const value = price * reserve;
      return { label: symbol, value }
    }));
    return this.setState({ data });
  }

  render() {
    const { classes } = this.props;
    let { data } = this.state;
    const colors = ['#147AD6', '#79D2DE', '#EC6666'];
    data = data.map((datum, i) => ({ ...datum, color: colors[i] }));
    const labels = data.map(({ label }) => label);
    const values = data.map(({ value }) => value);
    const styles = {
      label: 'Volume 24h',
      backgroundColor: data ? data.map(e => e.color) : [],
      borderColor: data ? data.map(e => e.color) : [],
      borderRadius: 0,
    };

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Reserves</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Grid item xs={12} md={8} lg={6} xl={3}>
              <Chart data={values} labels={labels} styles={styles} type="doughnut" disableAxe={true} />
            </Grid>
            <Grid item xs={12}>
              {data.map(({ label, value, color }, i) => {
                return <Grid className={classes.circle} key={i}>
                  <Typography variant="body2">{label}: ${numeral(value).format('0.[0]a')}</Typography>
                  <Grid style={{ background: color }} className="circle" />
                </Grid>
              })}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Reserve.defaultProps = {
  poolData: {}
}

Reserve.propTypes = {
  poolData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Reserve)));