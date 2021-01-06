import React, { Component, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';

import { VisibilityRounded, CloseRounded, RemoveRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import sol from 'helpers/sol';
import utils from 'helpers/utils';
import styles from './styles';
import { updateWallet } from 'modules/wallet.reducer';

function Row(props) {
  const {
    data: {
      address: senAddress,
      sen: senAmount,
      initialized,
      pool: {
        address: _poolAddress,
        fee_numerator,
        fee_denominator,
        reserve: poolReserve,
        sen,
        token,
        treasury
      }
    },
    onRemove
  } = props;
  const [visible, onVisible] = useState(false);
  const classes = makeStyles(styles)();

  if (!initialized) return null;
  const symbol = sol.toSymbol(token.symbol);
  const totalSupply = utils.prettyNumber(utils.div(token.total_supply, global.BigInt(10 ** token.decimals)));
  const balance = utils.prettyNumber(utils.div(senAmount, global.BigInt(10 ** token.decimals)));
  const price = utils.div(sen, poolReserve);
  const fee = utils.div(fee_numerator, fee_denominator) * 100;
  const reserve = utils.prettyNumber(utils.div(poolReserve, global.BigInt(10 ** token.decimals)));
  const onOpen = () => onVisible(true);
  const onClose = () => onVisible(false);
  return <Fragment>
    <TableRow>
      <TableCell>
        <IconButton size="small" color="secondary" onClick={onOpen}>
          <VisibilityRounded />
        </IconButton>
      </TableCell>
      <TableCell>
        <Typography>{senAddress}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{symbol}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{balance}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{price}</Typography>
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" color="primary" onClick={onRemove}>
          <RemoveRounded />
        </IconButton>
      </TableCell>
    </TableRow>
    <Dialog open={visible} onClose={onClose}>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Pool Info</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2">Pool</Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField label="Pool Address" variant="outlined" value={_poolAddress} fullWidth />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Fee %" variant="outlined" value={fee} fullWidth />
          </Grid>
          <Grid item xs={8}>
            <TextField label="Treasury Address" variant="outlined" value={treasury.address} fullWidth />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Reserve" variant="outlined" value={reserve} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">Token</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={symbol}
              variant="outlined"
              value={token.address}
              helperText={`Total supply: ${totalSupply} - Decimals: ${token.decimals}`}
              fullWidth />
          </Grid>
          <Grid item xs={12} /> {/* Safe space */}
        </Grid>
      </DialogContent>
    </Dialog>
  </Fragment>
}

class Info extends Component {
  constructor() {
    super();

    this.state = {
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
    const { wallet: { user: { lptAccounts } } } = this.props;
    return Promise.all(lptAccounts.map(lptAccount => {
      return sol.getPoolData(lptAccount);
    })).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return console.error(er);
    });
  }

  onRemove = (address) => {
    const { wallet: { user }, updateWallet } = this.props;
    const lptAccounts = user.lptAccounts.filter(lptAccount => lptAccount !== address);
    return updateWallet({ ...user, lptAccounts });
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableContainer component={BaseCard} className={classes.card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography variant="body2">LPT Account</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">Token</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">$</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">Price</Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(data => <Row
                key={data.address}
                data={data}
                onRemove={() => this.onRemove(data.address)}
              />)}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updateWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));