import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Paper from 'senswap-ui/paper';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';

import Modal from './modal';

import styles from './styles';
class StakePool extends Component {
  constructor() {
    super();

    this.state = {
      fields: [
        { label: '#', key: '' },
        { label: 'Stake pool', key: 'stake_pool' },
        { label: 'Pending Reward', key: 'pending_reward' },
        { label: 'Staked', key: 'staked' },
        { label: 'APR', key: 'apr' },
        { label: 'APY', key: 'apy' },
        { label: 'Total Value', key: 'total_value' },
        { label: '', key: 'action' },
      ],
      data: [
        {
          name: 'BTC-SEN',
          pendingReward: 1.2,
          staked: 0.2,
          apr: '10%',
          apy: '80%',
          totalValue: '2,353,331,555',
        },
        {
          name: 'BTC-SEN',
          pendingReward: 1.2,
          staked: 0.2,
          apr: '10%',
          apy: '80%',
          totalValue: '2,353,331,555',
        },
        {
          name: 'BTC-SEN',
          pendingReward: 1.2,
          staked: 0.2,
          apr: '10%',
          apy: '80%',
          totalValue: '2,353,331,555',
        }
      ],
      visible: false,
      modalData: [],
    }
  }
  onClose = () => {
    this.setState({ modalData: [] })
    return this.setState({ visible: false });
  }
  onOpen = (data) => {
    if (!data) return;
    this.setState({ visible: true });
    this.setState({ modalData: data });
  }

  render() {
    const { classes } = this.props;
    const { fields, data, visible, modalData } = this.state;

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow style={{ borderBottom: '1px solid #dadada' }}>
                  {fields.map((e, idx) => {
                    return <TableCell key={idx}>{e.label}</TableCell>
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((e, idx) => {
                  return <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.pendingReward}</TableCell>
                    <TableCell>{e.staked}</TableCell>
                    <TableCell>{e.apr}</TableCell>
                    <TableCell>{e.apy}</TableCell>
                    <TableCell>{e.totalValue}</TableCell>
                    <TableCell>
                      <Button onClick={() => this.onOpen(e)}>Farming</Button>
                    </TableCell>
                  </TableRow>
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <Modal visible={visible} onClose={this.onClose} modalData={modalData} />
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

StakePool.propTypes = {
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(StakePool)));