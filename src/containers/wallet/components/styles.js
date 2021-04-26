// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  lptIcon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    background: 'linear-gradient(45deg, hsla(145, 83%, 74%, 1) 0%, hsla(204, 77%, 76%, 1) 100%)',
    cursor: 'pointer',
    boxShadow: theme.shadows[3],
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  },
  accountIcon: {
    // width: theme.spacing(4),
    // height: theme.spacing(4),
    background: 'linear-gradient(45deg, hsla(33, 100%, 53%, 1) 0%, hsla(58, 100%, 68%, 1) 100%)',
    cursor: 'pointer',
    boxShadow: theme.shadows[3],
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  },
  mintIcon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    background: '#ffffff',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    boxShadow: theme.shadows[3],
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  },
  networkIcon: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    background: '#ffffff',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    boxShadow: theme.shadows[3],
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  },
  address: {
    fontSize: 10
  },
  tools: {
    width: `calc(100% - ${theme.spacing(2)}px)`,
    margin: `${theme.spacing(-1)}px ${theme.spacing(1)}px`,
  },
  badgeIcon: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    background: '#ffffff',
    cursor: 'pointer',
  },
});
