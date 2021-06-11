import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import Utils from 'helpers/utils';

import { setError } from 'modules/ui.reducer';
import { getBoardStat } from 'modules/board.reducer';

import styles from './styles';


class ROI extends Component {
  constructor() {
    super();

    this.state = {
      info: {},
    }
  }

  componentDidMount() {
    this.getStat();
  }
  getStat = async () => {
    const { getBoardStat, poolAddress: address } = this.props;
    try {
      const data = await getBoardStat(address);
      if (data) this.setState({ info: data });
    } catch (err) {
      return setError(err);
    }
  }
  render() {
    const { info } = this.state;

    return <Grid container>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">
                  <Typography variant="body2" color="textSecondary">ROI</Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography variant="body2" color="textSecondary">Duration</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 30, 90, 365].map((e, idx) => {
                return <TableRow key={idx}>
                  <TableCell>
                    <Typography>{(info && info.roi) ? Utils.getAnnualPercentage(Number(info.roi), e) : 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{Utils.formatTime(e)}</Typography>
                  </TableCell>
                </TableRow>
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getBoardStat,
}, dispatch);

ROI.propTypes = {
  poolAddress: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ROI)));