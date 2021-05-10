// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  card: {
    borderRadius: theme.shape.borderRadius * 2,
  },
  cardContent: {
    padding: `${theme.spacing(3)}px ${theme.spacing(3)}px ${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
  cardInfo: {
    padding: `${theme.spacing(1.5)}px ${theme.spacing(3)}px`,
    backgroundColor: theme.palette.background.secondary,
  },
  cardAction: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px !important`,
  },
});
