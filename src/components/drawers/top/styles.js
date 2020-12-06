export default theme => ({
  paper: {
    padding: theme.spacing(1),
    borderRadius: `0px 0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
  },
  paperContent: {
    height: `calc(100% + ${theme.spacing(2)}px)`,
  },
  paperBody: {
    maxHeight: theme.spacing(50),
    height: `calc(100% - ${theme.spacing(2) + 4}px)`,
    overflowY: 'scroll',
  },
  swipeableArea:{
    cursor: 'pointer',
  },
  touchBarSign: {
    width: 48,
    height: 4,
    backgroundColor: '#0000008a',
    borderRadius: 2,
  }
});