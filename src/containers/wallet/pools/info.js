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

import { VisibilityRounded, CloseRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import sol from 'helpers/sol';
import utils from 'helpers/utils';
import styles from './styles';

function Row(props) {
  const {
    data: {
      address: _senAddress,
      sen: balance,
      initialized,
      pool: {
        address: _poolAddress,
        fee_numerator,
        fee_denominator,
        reserve,
        sen,
        token,
        treasury
      }
    }
  } = props;
  const [visible, onVisible] = useState(false);
  const classes = makeStyles(styles)();

  if (!initialized) return null;
  const _symbol = token.symbol.join('').replace('-', '');
  const _totalSupply = utils.prettyNumber(Number((token.total_supply / global.BigInt(10 ** token.decimals)).toString()));
  const _value = utils.prettyNumber(Number((balance / global.BigInt(10 ** token.decimals)).toString()));
  const priceFloor = reserve ? Number((sen / reserve).toString()) : 0;
  const priceDecimals = reserve ? Number((sen % reserve).toString()) : 0;
  const _price = Number(priceFloor + '.' + priceDecimals);
  const feeFloor = Number((fee_numerator / fee_denominator).toString());
  const feeDecimals = Number((fee_numerator % fee_denominator).toString());
  const _fee = Number(feeFloor + '.' + feeDecimals);
  const _reserve = utils.prettyNumber(Number((reserve / global.BigInt(10 ** token.decimals)).toString()));
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
        <Typography>{_senAddress}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{_symbol}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{_value}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{_price}</Typography>
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
            <TextField label="Fee" variant="outlined" value={_fee} fullWidth />
          </Grid>
          <Grid item xs={8}>
            <TextField label="Treasury Address" variant="outlined" value={treasury.address} fullWidth />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Reserve" variant="outlined" value={_reserve} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">Token</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={_symbol}
              variant="outlined"
              value={token.address}
              helperText={`Total supply: ${_totalSupply} - Decimals: ${token.decimals}`}
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
    })).then(sensData => {
      return this.setState({ sensData });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { sensData } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableContainer component={BaseCard} className={classes.card} >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography variant="body2">Sen Address</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">Token</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">Value</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">Price</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sensData.map(data => <Row key={data.address} data={data} />)}
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

}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));