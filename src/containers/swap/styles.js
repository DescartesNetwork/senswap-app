export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  icon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  iconWithMarginLeft: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(1),
  },
  owner: {
    fontSize: 9
  },
  tools: {
    width: `calc(100% - ${theme.spacing(2)}px)`,
    margin: `${theme.spacing(-1)}px ${theme.spacing(1)}px`,
  },
  badge: {
    padding: 0,
  },
  badgeIcon: {
    fontSize: '1rem'
  },
  verified: {
    background: 'linear-gradient(45deg, hsla(217, 100%, 50%, 1) 0%, hsla(186, 100%, 69%, 1) 100%)'
  },
  unverified: {
    background: 'linear-gradient(45deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)'
  },
  price: {
    fontSize: 10,
    color: theme.palette.text.secondary
  }
});
