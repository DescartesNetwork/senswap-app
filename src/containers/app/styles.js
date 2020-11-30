export default theme => {
  console.log(theme);
  return {
    safe: {
      margin: -theme.spacing(1) / 2
    }
  }
};