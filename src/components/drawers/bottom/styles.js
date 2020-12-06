export default theme => ({
  paper: {
    height: '95%',
    padding: theme.spacing(1),
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`,
  },
  paperContent: {
    height: `calc(100% + ${theme.spacing(2)}px)`,
  },
  paperBody: {
    height: `calc(100% - ${theme.spacing(2) + 4}px)`,
    overflowY: 'scroll',
  },
  swipeableArea: {
    cursor: 'pointer',
  },
  touchBarSign: {
    width: 48,
    height: 4,
    backgroundColor: '#0000008a',
    borderRadius: 2,
  }
});