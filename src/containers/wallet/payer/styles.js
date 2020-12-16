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
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(1) / 2,
    paddingBottom: theme.spacing(1) / 2,
    background: 'linear-gradient(163.28deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
    backdropFilter: 'blur(20px)'
  }
});
