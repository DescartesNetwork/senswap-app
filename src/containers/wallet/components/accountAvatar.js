import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';

import styles from './styles';
import utils from 'helpers/utils';


class AccountAvatar extends Component {

  render() {
    const { classes } = this.props;
    const { address, title, onClick } = this.props;

    return <Tooltip title={title}>
      <Avatar className={classes.accountIcon} onClick={onClick}>
        <Typography variant="h5">{utils.randEmoji(address)}</Typography>
      </Avatar>
    </Tooltip>
  }
}

AccountAvatar.defaultProps = {
  address: '',
  title: '',
  onClick: () => { },
}

AccountAvatar.propTypes = {
  address: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
}

export default withStyles(styles)(AccountAvatar);