import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Drain from 'senswap-ui/drain';
import { ListItem, ListItemAvatar, ListItemText } from 'senswap-ui/list';
import Divider from 'senswap-ui/divider';
import Link from 'senswap-ui/link';
import Avatar from 'senswap-ui/avatar';

import {
  OpenInNewRounded, DirectionsRunRounded, FlightTakeoffRounded,
  SwapCallsRounded, FlightLandRounded, InputRounded,
} from 'senswap-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';


class EventItem extends Component {

  parseTitle = () => {
    const { variant } = this.props;
    switch (variant) {
      case 'default':
        return 'Transaction';
      case 'send':
        return 'Send';
      case 'receive':
        return 'Receive';
      case 'swap':
        return 'Swap';
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdraw';
      default:
        return 'Transaction';
    }
  }

  parseIcon = () => {
    const { variant } = this.props;
    switch (variant) {
      case 'default':
        return <DirectionsRunRounded />;
      case 'send':
        return <FlightTakeoffRounded />;
      case 'receive':
        return <FlightLandRounded />;
      case 'swap':
        return <SwapCallsRounded />;
      case 'deposit':
        return <InputRounded />;
      case 'withdraw':
        return <OpenInNewRounded />;
      default:
        return <DirectionsRunRounded />;
    }
  }

  parseColor = () => {
    const { classes, variant } = this.props;
    return classes[variant] || classes.default;
  }

  render() {
    const { classes, link, amount, unit } = this.props;

    return <Fragment>
      <ListItem className={classes.listItem} alignItems="flex-start">
        <ListItemAvatar className={classes.avatarItem}>
          <Avatar size="medium" className={this.parseColor()} >
            {this.parseIcon()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <Grid container spacing={0} className={classes.noWrap} alignItems="center">
                <Grid item className={classes.stretch}>
                  <Typography variant="subtitle1">{this.parseTitle()}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="caption" color="textSecondary">{utils.prettyDatetime(new Date())}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Link
                variant="body2"
                href={utils.explorer(link)}
                style={{ color: '#4FBF67' }}
              >View on explorer</Link>
            </Grid>
            {amount ? <Fragment>
              <Grid item xs={12} >
                <Drain size={1} />
              </Grid>
              <Grid item xs={12}>
                <Typography>{utils.prettyNumber(amount)} {unit}</Typography>
              </Grid>
            </Fragment> : null}
          </Grid>
        </ListItemText>
      </ListItem>
      <Divider variant="inset" />
    </Fragment>
  }
}

EventItem.defaultProps = {
  unit: 'Unknown',
  amount: 0,
  variant: 'default',
  link: ''
}

EventItem.propsType = {
  unit: PropTypes.string,
  amount: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'send', 'receive', 'swap', 'deposit', 'withdraw']),
  link: PropTypes.string,
}

export default withStyles(styles)(EventItem);