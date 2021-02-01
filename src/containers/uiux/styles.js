export default theme => {
  console.log(theme);
  return {
    noWrap: {
      flexWrap: 'nowrap',
    },
    stretch: {
      flex: '1 1 auto',
    },
    icon: {
      fontSize: theme.spacing(10)
    }
  }
}