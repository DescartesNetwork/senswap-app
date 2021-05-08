// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
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
