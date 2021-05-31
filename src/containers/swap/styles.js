// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  opticalCorrectionBrand: {
    marginLeft: -theme.spacing(1 / 2)
  },
  paper: {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(4),
    height: `calc(100% - ${theme.spacing(8)}px)`
  },
  details: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.secondary
  },
  opticalCorrection: {
    marginLeft: -8
  },
  unit: {
    fontSize: 8,
    color: '#808191'
  },
  // Status
  success: {
    color: theme.palette.success.main,
  },
  failed: {
    color: theme.palette.error.main,
  }
});