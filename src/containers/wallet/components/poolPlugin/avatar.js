import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';

import styles from './styles';


class PoolAvatar extends Component {

  render() {
    const { classes } = this.props;
    const { title, icons, marginRight, onClick } = this.props;

    return <Tooltip title={title}>
      <AvatarGroup max={3} onClick={onClick} style={{ marginRight: marginRight ? 8 : 0 }}>
        {icons.map((icon, index) => <Avatar key={index} src={icon} className={classes.icon} />)}
      </AvatarGroup>
    </Tooltip>
  }
}

PoolAvatar.defaultProps = {
  icons: [],
  title: '',
  marginRight: false,
  onClick: () => { },
}

PoolAvatar.propTypes = {
  icons: PropTypes.array,
  title: PropTypes.string,
  marginRight: PropTypes.bool,
  onClick: PropTypes.func,
}

export default withStyles(styles)(PoolAvatar);