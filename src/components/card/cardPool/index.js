import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Card, { CardContent } from 'senswap-ui/card';
import Typography from 'senswap-ui/typography';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';
import Divider from 'senswap-ui/divider';
import Button from 'senswap-ui/button';

import { AccountBalanceWalletOutlined, InputRounded, OpenInNewRounded } from 'senswap-ui/icons';

import styles from './styles';


class CardPool extends Component {

  onAction = () => {
    const { onConnect, onDeposit, onWithdraw } = this.props;
    if (onConnect) return <Grid item xs={12}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AccountBalanceWalletOutlined />}
        size="large"
        onClick={onConnect}
        fullWidth
      >
        <Typography>Connect Wallet</Typography>
      </Button>
    </Grid>
    if (onDeposit && onWithdraw) return <Fragment>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<InputRounded />}
          size="large"
          onClick={onDeposit}
          fullWidth
        >
          <Typography>Deposit</Typography>
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="outlined"
          startIcon={<OpenInNewRounded />}
          size="large"
          onClick={onWithdraw}
          fullWidth
        >
          <Typography>Withdraw</Typography>
        </Button>
      </Grid>
    </Fragment>
    return <Grid item xs={12}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<InputRounded />}
        size="large"
        onClick={onDeposit}
        fullWidth
      >
        <Typography>Deposit</Typography>
      </Button>
    </Grid>
  }

  render() {
    const { classes } = this.props;
    const { icons, symbols, volume, apy, stake } = this.props;

    return <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Grid container>
          <Grid item xs={12}>
            <AvatarGroup max={3}>
              {icons.map((icon, i) => <Avatar key={i} size="small" src={icon} />)}
            </AvatarGroup>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{symbols.join(' x ')} Pool</Typography>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent className={classes.cardContent}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2">Pool vol</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4">${numeral(volume).format('0.0[00]a')} </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardContent className={classes.cardInfo}>
        <Grid container spacing={1}>
          {apy ? <Fragment>
            <Grid item xs={6}>
              <Typography variant="body2">APY:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography align="right" variant="body2"><strong>{apy}%</strong></Typography>
            </Grid>
          </Fragment> : null}
          <Grid item xs={6}>
            <Typography variant="body2">Your stake:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right" variant="body2"><strong>{stake || 0}</strong></Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardContent className={classes.cardAction}>
        <Grid container>
          {this.onAction()}
        </Grid>
      </CardContent>
    </Card>
  }
}

CardPool.defaultProps = {
  symbols: [],
  icons: [],
  volume: 0,
  apy: 0,
  stake: 0,
}

CardPool.propsType = {
  symbols: PropTypes.arrayOf(PropTypes.string),
  icons: PropTypes.arrayOf(PropTypes.string),
  volume: PropTypes.number,
  apy: PropTypes.number,
  stake: PropTypes.number,
  onConnect: PropTypes.func,
  onDeposit: PropTypes.func,
  onWithdraw: PropTypes.func,
}

export default withStyles(styles)(CardPool);