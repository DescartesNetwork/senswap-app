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
  iconWithMarginRight: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(1),
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
  badgeIcon: {
    fontSize: '1rem'
  },
});
