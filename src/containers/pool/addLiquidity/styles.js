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
  subtitle: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeightLight,
    color: theme.palette.text.secondary
  },
  action: {
    backgroundColor: '#F2F3F5',
    borderRadius: theme.shape.borderRadius,
    paddingTop: theme.spacing(2)
  },
});
