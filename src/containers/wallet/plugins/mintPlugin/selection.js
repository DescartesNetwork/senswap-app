import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import { IconButton } from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Table, { TableBody, TableCell, TableContainer, TableRow } from 'senswap-ui/table';
import CircularProgress from 'senswap-ui/circularProgress';

import { CloseRounded, SearchRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getMints, getMint } from 'modules/mint.reducer';

class Selection extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      search: '',
      data: [],
    }
  }

  componentDidMount() {
    const { always } = this.props;
    if (always) this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { visible: prevVisible } = prevProps;
    const { visible } = this.props;
    if (!isEqual(prevVisible, visible) && visible) this.fetchData();
  }

  fetchData = async () => {
    const { setError, getMints, getMint, always, condition } = this.props;
    this.setState({ loading: true });
    try {
      let data = await getMints(condition, 5, 0);
      data = await Promise.all(data.map(({ address }) => getMint(address)));
      return this.setState({ data, loading: false }, () => {
        if (always && data.length) this.onChange(data[0].address);
      });
    } catch (er) {
      return setError(er);
    }
  }

  onSearch = (e) => {
    const search = e.target.value || '';
    const { setError, getMints, getMint } = this.props;
    return this.setState({ loading: true, search }, () => {
      const condition = !search ? {} : {
        '$or': [
          { symbol: { '$regex': search, '$options': 'gi' } },
          { name: { '$regex': search, '$options': 'gi' } }
        ]
      }
      return getMints(condition, 1000, 0).then(data => {
        return Promise.all(data.map(({ address }) => getMint(address)));
      }).then(data => {
        return this.setState({ loading: false, data });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onChange = (expectedAddress) => {
    const { onChange } = this.props;
    const { data } = this.state;
    const [mintData] = data.filter(({ address }) => expectedAddress === address);
    return onChange(mintData);
  }

  render() {
    const { classes } = this.props;
    const { visible, onClose } = this.props;
    const { loading, search, data } = this.state;

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6"><strong>Token List</strong></Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              variant="contained"
              placeholder="Search token"
              value={search}
              onChange={this.onSearch}
              InputProps={{
                startAdornment: <IconButton size="small">
                  {loading ? <CircularProgress size={17} /> : <SearchRounded />}
                </IconButton>
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableBody>
                  {!data.length ? <TableRow>
                    <TableCell >
                      <Typography variant="caption">No token</Typography>
                    </TableCell>
                  </TableRow> : null}
                  {data.map(mintData => {
                    const { address, icon, name, symbol } = mintData;
                    return <TableRow key={address} className={classes.tableRow} onClick={() => this.onChange(address)}>
                      <TableCell >
                        <Grid container className={classes.noWrap} alignItems="center">
                          <Grid item>
                            <MintAvatar icon={icon} />
                          </Grid>
                          <Grid item>
                            <Typography>{name}</Typography>
                          </Grid>
                          <Grid item>
                            <Typography color="textSecondary">{symbol}</Typography>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
    </Dialog>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getMints, getMint,
}, dispatch);

Selection.defaultProps = {
  visible: false,
  always: false,
  condition: {},
  onChange: () => { },
  onClose: () => { },
}

Selection.propTypes = {
  visible: PropTypes.bool,
  always: PropTypes.bool,
  condition: PropTypes.object,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Selection)));