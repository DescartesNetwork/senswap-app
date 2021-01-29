export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  card: {
    background: 'linear-gradient(45deg, hsla(138, 82%, 69%, 1) 0%, hsla(186, 100%, 50%, 1) 100%)'
  },
  paper: {
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    width: `calc(100% - ${theme.spacing(2)}px)`
  }
});
