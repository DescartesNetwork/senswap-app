export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  card: {
    background: 'linear-gradient(45deg, hsla(31, 90%, 76%, 1) 0%, hsla(302, 82%, 76%, 1) 100%)'
  },
  paper: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(1) / 2,
    paddingBottom: theme.spacing(1) / 2,
    width: `calc(100% - ${theme.spacing(2)}px)`
  }
});
