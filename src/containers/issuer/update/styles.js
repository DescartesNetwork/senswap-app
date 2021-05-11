// eslint-disable-next-line
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
    marginRight: theme.spacing(1),
  },
  address: {
    fontSize: 10
  },
  tools: {
    width: `calc(100% - ${theme.spacing(2)}px)`,
    margin: `${theme.spacing(-1)}px ${theme.spacing(1)}px`,
  },
});