// eslint-disable-next-line
export default theme => {
  window.senswap.theme = theme; // You can log this var for development
  return {
    noWrap: {
      flexWrap: 'nowrap',
    },
    stretch: {
      flex: '1 1 auto',
    },
    icon: {
      fontSize: theme.spacing(10)
    },
    backdrop: {
      background: 'linear-gradient(163.28deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
      backdropFilter: `blur(${theme.spacing(2)}px)`,
      WebkitBackdropFilter: `blur(${theme.spacing(2)}px)`,
      zIndex: theme.zIndex.tooltip + 1,
    }
  }
}