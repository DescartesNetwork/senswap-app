// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  drawer: {
    width: theme.spacing(35),
    padding: theme.spacing(4),
  },
  listItem: {
    padding: `${theme.spacing(2)}px 0px`,
  },
  avatarItem: {
    marginRight: theme.spacing(2)
  }
});