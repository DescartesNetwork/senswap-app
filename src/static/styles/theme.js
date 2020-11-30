import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#FF3E3C' },
    secondary: { main: '#012639' },
    textPrimary: { main: '#000000' },
    textSecondary: { main: '#FFFFFF' },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Pridi',
    fontSize: 12,
    h1: { fontWeight: 300, textTransform: 'None' },
    h2: { fontWeight: 700, textTransform: 'None' },
    h3: { fontWeight: 300, textTransform: 'None' },
    h4: { fontWeight: 700, textTransform: 'None' },
    h5: { fontWeight: 300, textTransform: 'None' },
    h6: { fontWeight: 700, textTransform: 'None' },
    subtitle1: { fontWeight: 300, textTransform: 'None' },
    subtitle2: { fontWeight: 700, textTransform: 'None' },
    body1: { fontWeight: 300, textTransform: 'None' },
    body2: { fontWeight: 700, textTransform: 'None' },
  },
  shadows: [
    'none',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.003), 0 6.7px 5.3px rgba(0, 0, 0, 0.004), 0 12.5px 10px rgba(0, 0, 0, 0.005), 0 22.3px 17.9px rgba(0, 0, 0, 0.006), 0 41.8px 33.4px rgba(0, 0, 0, 0.007), 0 100px 80px rgba(0, 0, 0, 0.01)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.006), 0 6.7px 5.3px rgba(0, 0, 0, 0.008), 0 12.5px 10px rgba(0, 0, 0, 0.01), 0 22.3px 17.9px rgba(0, 0, 0, 0.012), 0 41.8px 33.4px rgba(0, 0, 0, 0.014), 0 100px 80px rgba(0, 0, 0, 0.02)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.008), 0 6.7px 5.3px rgba(0, 0, 0, 0.012), 0 12.5px 10px rgba(0, 0, 0, 0.015), 0 22.3px 17.9px rgba(0, 0, 0, 0.018), 0 41.8px 33.4px rgba(0, 0, 0, 0.022), 0 100px 80px rgba(0, 0, 0, 0.03)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.011), 0 6.7px 5.3px rgba(0, 0, 0, 0.016), 0 12.5px 10px rgba(0, 0, 0, 0.02), 0 22.3px 17.9px rgba(0, 0, 0, 0.024), 0 41.8px 33.4px rgba(0, 0, 0, 0.029), 0 100px 80px rgba(0, 0, 0, 0.04)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.014), 0 6.7px 5.3px rgba(0, 0, 0, 0.02), 0 12.5px 10px rgba(0, 0, 0, 0.025), 0 22.3px 17.9px rgba(0, 0, 0, 0.03), 0 41.8px 33.4px rgba(0, 0, 0, 0.036), 0 100px 80px rgba(0, 0, 0, 0.05)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.017), 0 6.7px 5.3px rgba(0, 0, 0, 0.024), 0 12.5px 10px rgba(0, 0, 0, 0.03), 0 22.3px 17.9px rgba(0, 0, 0, 0.036), 0 41.8px 33.4px rgba(0, 0, 0, 0.043), 0 100px 80px rgba(0, 0, 0, 0.06)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.02), 0 6.7px 5.3px rgba(0, 0, 0, 0.028), 0 12.5px 10px rgba(0, 0, 0, 0.035), 0 22.3px 17.9px rgba(0, 0, 0, 0.042), 0 41.8px 33.4px rgba(0, 0, 0, 0.05), 0 100px 80px rgba(0, 0, 0, 0.07)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.022), 0 6.7px 5.3px rgba(0, 0, 0, 0.032), 0 12.5px 10px rgba(0, 0, 0, 0.04), 0 22.3px 17.9px rgba(0, 0, 0, 0.048), 0 41.8px 33.4px rgba(0, 0, 0, 0.058), 0 100px 80px rgba(0, 0, 0, 0.08)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.025), 0 6.7px 5.3px rgba(0, 0, 0, 0.036), 0 12.5px 10px rgba(0, 0, 0, 0.045), 0 22.3px 17.9px rgba(0, 0, 0, 0.054), 0 41.8px 33.4px rgba(0, 0, 0, 0.065), 0 100px 80px rgba(0, 0, 0, 0.09)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.028), 0 6.7px 5.3px rgba(0, 0, 0, 0.04), 0 12.5px 10px rgba(0, 0, 0, 0.05), 0 22.3px 17.9px rgba(0, 0, 0, 0.06), 0 41.8px 33.4px rgba(0, 0, 0, 0.072), 0 100px 80px rgba(0, 0, 0, 0.1)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.031), 0 6.7px 5.3px rgba(0, 0, 0, 0.044), 0 12.5px 10px rgba(0, 0, 0, 0.055), 0 22.3px 17.9px rgba(0, 0, 0, 0.066), 0 41.8px 33.4px rgba(0, 0, 0, 0.079), 0 100px 80px rgba(0, 0, 0, 0.11)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.034), 0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06), 0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086), 0 100px 80px rgba(0, 0, 0, 0.12)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.037), 0 6.7px 5.3px rgba(0, 0, 0, 0.053), 0 12.5px 10px rgba(0, 0, 0, 0.065), 0 22.3px 17.9px rgba(0, 0, 0, 0.077), 0 41.8px 33.4px rgba(0, 0, 0, 0.093), 0 100px 80px rgba(0, 0, 0, 0.13)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.039), 0 6.7px 5.3px rgba(0, 0, 0, 0.057), 0 12.5px 10px rgba(0, 0, 0, 0.07), 0 22.3px 17.9px rgba(0, 0, 0, 0.083), 0 41.8px 33.4px rgba(0, 0, 0, 0.101), 0 100px 80px rgba(0, 0, 0, 0.14)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.042), 0 6.7px 5.3px rgba(0, 0, 0, 0.061), 0 12.5px 10px rgba(0, 0, 0, 0.075), 0 22.3px 17.9px rgba(0, 0, 0, 0.089), 0 41.8px 33.4px rgba(0, 0, 0, 0.108), 0 100px 80px rgba(0, 0, 0, 0.15)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.045), 0 6.7px 5.3px rgba(0, 0, 0, 0.065), 0 12.5px 10px rgba(0, 0, 0, 0.08), 0 22.3px 17.9px rgba(0, 0, 0, 0.095), 0 41.8px 33.4px rgba(0, 0, 0, 0.115), 0 100px 80px rgba(0, 0, 0, 0.16)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.048), 0 6.7px 5.3px rgba(0, 0, 0, 0.069), 0 12.5px 10px rgba(0, 0, 0, 0.085), 0 22.3px 17.9px rgba(0, 0, 0, 0.101), 0 41.8px 33.4px rgba(0, 0, 0, 0.122), 0 100px 80px rgba(0, 0, 0, 0.17)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.051), 0 6.7px 5.3px rgba(0, 0, 0, 0.073), 0 12.5px 10px rgba(0, 0, 0, 0.09), 0 22.3px 17.9px rgba(0, 0, 0, 0.107), 0 41.8px 33.4px rgba(0, 0, 0, 0.129), 0 100px 80px rgba(0, 0, 0, 0.18)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.053), 0 6.7px 5.3px rgba(0, 0, 0, 0.077), 0 12.5px 10px rgba(0, 0, 0, 0.095), 0 22.3px 17.9px rgba(0, 0, 0, 0.113), 0 41.8px 33.4px rgba(0, 0, 0, 0.137), 0 100px 80px rgba(0, 0, 0, 0.19)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.056), 0 6.7px 5.3px rgba(0, 0, 0, 0.081), 0 12.5px 10px rgba(0, 0, 0, 0.1), 0 22.3px 17.9px rgba(0, 0, 0, 0.119), 0 41.8px 33.4px rgba(0, 0, 0, 0.144), 0 100px 80px rgba(0, 0, 0, 0.2)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.059), 0 6.7px 5.3px rgba(0, 0, 0, 0.085), 0 12.5px 10px rgba(0, 0, 0, 0.105), 0 22.3px 17.9px rgba(0, 0, 0, 0.125), 0 41.8px 33.4px rgba(0, 0, 0, 0.151), 0 100px 80px rgba(0, 0, 0, 0.21)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.062), 0 6.7px 5.3px rgba(0, 0, 0, 0.089), 0 12.5px 10px rgba(0, 0, 0, 0.11), 0 22.3px 17.9px rgba(0, 0, 0, 0.131), 0 41.8px 33.4px rgba(0, 0, 0, 0.158), 0 100px 80px rgba(0, 0, 0, 0.22)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.065), 0 6.7px 5.3px rgba(0, 0, 0, 0.093), 0 12.5px 10px rgba(0, 0, 0, 0.115), 0 22.3px 17.9px rgba(0, 0, 0, 0.137), 0 41.8px 33.4px rgba(0, 0, 0, 0.165), 0 100px 80px rgba(0, 0, 0, 0.23)',
    '0 2.8px 2.2px rgba(0, 0, 0, 0.067), 0 6.7px 5.3px rgba(0, 0, 0, 0.097), 0 12.5px 10px rgba(0, 0, 0, 0.12), 0 22.3px 17.9px rgba(0, 0, 0, 0.143), 0 41.8px 33.4px rgba(0, 0, 0, 0.173), 0 100px 80px rgba(0, 0, 0, 0.24)',
  ]
});

export default theme;