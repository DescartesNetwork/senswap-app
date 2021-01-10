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
  add: {
    width: `calc(100% - ${theme.spacing(4)}px)`,
    margin: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  owner: {
    fontSize: 9
  }
});
