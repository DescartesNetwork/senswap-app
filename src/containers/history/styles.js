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
  },
  default: {
    color: theme.palette.common.white,
    backgroundColor: '#21232F',
  },
  send: {
    color: theme.palette.common.white,
    backgroundColor: '#6C5DD3',
  },
  receive: {
    color: theme.palette.common.white,
    backgroundColor: '#4FBF67',
  },
  swap: {
    color: theme.palette.common.white,
    backgroundColor: '#F9575E',
  },
  deposit: {
    color: theme.palette.common.white,
    backgroundColor: '#6C5DD3',
  },
  withdraw: {
    color: theme.palette.common.white,
    backgroundColor: '#4FBF67',
  },
});