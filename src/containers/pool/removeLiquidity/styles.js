export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  icon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  iconWithMarginLeft: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(2),
  },
  owner: {
    fontSize: 9
  },
  verified: {
    padding: 0,
    backgroundColor: theme.palette.info.main
  },
  unverified: {
    padding: 0,
    backgroundColor: theme.palette.error.main
  },
  tools: {
    width: `calc(100% - ${theme.spacing(2)}px)`,
    margin: `${theme.spacing(-1)}px ${theme.spacing(1)}px`,
  },
  badgeIcon: {
    fontSize: '1rem'
  },
});
