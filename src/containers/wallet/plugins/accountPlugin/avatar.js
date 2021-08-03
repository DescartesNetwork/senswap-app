import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ssjs from 'senswapjs';

import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';

import { withStyles } from 'senswap-ui/styles';
import Typography from 'senswap-ui/typography';
import Avatar from 'senswap-ui/avatar';

import styles from './styles';

class AccountAvatar extends Component {

  render() {
    const { classes } = this.props;
    const { address, icon, title, marginRight, onClick } = this.props;

    return <Badge
      badgeContent={<Avatar className={classes.badgeIcon} src={icon} />}
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      invisible={!icon}
    >
      <Tooltip title={title}>
        <Avatar
          className={classes.accountIcon}
          onClick={onClick}
          style={{ marginRight: marginRight ? 8 : 0 }}
        >
          <Typography variant="h6">{ssjs.randEmoji(address)}</Typography>
        </Avatar>
      </Tooltip>
    </Badge>
  }
}

AccountAvatar.defaultProps = {
  address: '',
  title: '',
  icon: '',
  marginRight: false,
  onClick: () => { },
}

AccountAvatar.propTypes = {
  address: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.string,
  marginRight: PropTypes.bool,
  onClick: PropTypes.func,
}

export default withStyles(styles)(AccountAvatar);