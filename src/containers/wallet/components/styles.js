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
    marginRight: theme.spacing(1),
    background: 'linear-gradient(45deg, hsla(145, 83%, 74%, 1) 0%, hsla(204, 77%, 76%, 1) 100%)'
  },
  accountIcon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(1),
    background: 'linear-gradient(45deg, hsla(33, 100%, 53%, 1) 0%, hsla(58, 100%, 68%, 1) 100%)'
  },
  address: {
    fontSize: 10
  }
});
