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
import { updateSen } from 'modules/wallet.reducer';

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
  const symbol = token.symbol.join('').replace('-', '');
  const totalSupply = utils.prettyNumber(utils.div(token.total_supply, global.BigInt(10 ** token.decimals)));
  const balance = utils.prettyNumber(utils.div(senAmount, global.BigInt(10 ** token.decimals)));
  const price = utils.div(sen, poolReserve);
  const fee = utils.div(fee_numerator, fee_denominator);
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
      <TableCell>
        <Typography>{symbol}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{balance}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{price}</Typography>
      </TableCell>
      <TableCell>
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
            <TextField label="Fee" variant="outlined" value={fee} fullWidth />
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

  onRemove = (address) => {
    const { wallet: { sens }, updateSen } = this.props;
    const newSens = sens.filter(senAddress => senAddress !== address);
    return updateSen(newSens);
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
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {sensData.map(data => <Row
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
  updateSen,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));