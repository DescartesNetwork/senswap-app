// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.secondary,
    padding: theme.spacing(2)
  },
  input: {
    margin: `0px 0px ${-theme.spacing(2)}px 0px`,
    fontFamily: 'Poppins',
    fontWeight: 600,
    fontSize: 40,
    textTransform: 'None'
  }
});
