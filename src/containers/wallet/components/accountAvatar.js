import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

import styles from './styles';

class AccountAvatar extends Component {

  render() {
    const { classes } = this.props;
    const { address, icon, title, marginRight, onClick } = this.props;

    return <Badge
      badgeContent={<Avatar className={classes.badgeIcon} src={icon} />}
      overlap="circle"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      invisible={!icon}
    >
      <Tooltip title={title}>
        <Avatar className={classes.accountIcon} onClick={onClick} style={{ marginRight: marginRight ? 8 : 0 }}>
          <Typography variant="h5">{ssjs.randEmoji(address)}</Typography>
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