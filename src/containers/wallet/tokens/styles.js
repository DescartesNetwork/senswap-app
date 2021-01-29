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
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    width: `calc(100% - ${theme.spacing(2)}px)`
  },
  icon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    background: 'linear-gradient(45deg, hsla(33, 100%, 53%, 1) 0%, hsla(58, 100%, 68%, 1) 100%)'
  }
});
