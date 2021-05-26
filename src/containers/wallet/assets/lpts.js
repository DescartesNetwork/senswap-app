import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';
import CircularProgress from 'senswap-ui/circularProgress';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import Favorite from 'senswap-ui/favorite';
import Button from 'senswap-ui/button';

import { } from 'senswap-ui/icons';

import { PoolAvatar } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class LPTs extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(prevWallet, wallet)) return this.fetchData();
  }

  fetchData = async () => {
    const { wallet: { lpts }, getAccountData } = this.props;
    this.setState({ loading: true });
    let data = [];
    for (let lptAddress of lpts) {
      try {
        const accountData = await getAccountData(lptAddress);
        const { pool: poolData } = accountData || {}
        const { address: poolAddress } = poolData || {}
        if (!ssjs.isAddress(poolAddress)) continue;
        data.push(accountData);
        this.setState({ data: [...data] });
      } catch(er){
        // Nothing
      }
    }
    return this.setState({ loading: false });
  }

  render() {
    const { classes } = this.props;
    const { loading, data } = this.state;

    return <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <Typography variant="caption" color="textSecondary">LP TOKEN</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="caption" color="textSecondary">AMOUNT</Typography>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {!data.length ? <TableRow>
            <TableCell />
            <TableCell >
              {loading ? <CircularProgress size={17} /> : <Typography variant="caption">No token</Typography>}
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow> : null}
          {data.map(lptData => {
            const {
              address, amount, mint: { decimals },
              pool: {
                mint_s: { icon: iconS, symbol: symbolS },
                mint_a: { icon: iconA, symbol: symbolA },
                mint_b: { icon: iconB, symbol: symbolB },
              }
            } = lptData;
            const icons = [iconA, iconB, iconS];
            const name = `${symbolA || '.'} x ${symbolB || '.'} x ${symbolS || '.'}`;
            return <TableRow key={address} className={classes.tableRow}>
              <TableCell >
                <Favorite />
              </TableCell>
              <TableCell>
                <Grid container className={classes.noWrap} alignItems="center">
                  <Grid item>
                    <PoolAvatar icons={icons} />
                  </Grid>
                  <Grid item>
                    <Typography>{name || 'UNKNOWN'}</Typography>
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell>
                <Typography>{utils.prettyNumber(ssjs.undecimalize(amount, decimals))}</Typography>
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="primary"
                >
                  <Typography>Go to pool</Typography>
                </Button>
              </TableCell>
            </TableRow>
          })}
        </TableBody>
      </Table>
    </TableContainer>
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

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LPTs)));