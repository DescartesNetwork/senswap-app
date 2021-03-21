import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';

import { HelpOutlineRounded } from '@material-ui/icons';

import styles from './styles';

class MintAvatar extends Component {

  render() {
    const { classes } = this.props;
    const { icon, title, marginRight, onClick } = this.props;

    return <Tooltip title={title}>
      <Avatar
        className={classes.mintIcon}
        src={icon} onClick={onClick}
        style={{ marginRight: marginRight ? 8 : 0 }}
      >
        <HelpOutlineRounded />
      </Avatar>
    </Tooltip>
  }
}

MintAvatar.defaultProps = {
  icon: '',
  title: '',
  marginRight: false,
  onClick: () => { },
}

MintAvatar.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  marginRight: PropTypes.bool,
  onClick: PropTypes.func,
}

export default withStyles(styles)(MintAvatar);