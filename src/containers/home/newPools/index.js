import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {withStyles} from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import {CardPool} from 'senswap-ui/card';

import styles from './styles';

import * as report from '../../../helpers/report'
import * as moment from "moment";


class NewPools extends Component {

    componentDidMount() {
        // solana.getHistoryTokenTransaction("GHjB1mY6WinFHy6kz81boVBmGoaM5PN37r75TLJfcU3c")
        //solana.getHistoryTokenTransaction("4EGz1FgjUauAz9PeaKz4FBhVBvDpuiLAsZZSWzeMxayE")
        let timeFrom = moment().startOf('day').valueOf()
        let timeTo = moment().endOf('day').valueOf()
        //report.findAllTransactionByTime("52yrd8vkxUsoCcSkuQtBERNYuJ6ok5PFbf5MK6NqP8iY", timeFrom, timeTo)

        timeFrom = moment().subtract(2, "hour")
        timeTo = moment().endOf('day').valueOf()
        report.findAllTransactionByTime("8UaZw2jDhJzv5V53569JbCd3bD4BnyCfBH3sjwgajGS9", timeFrom, timeTo)
    }

    render() {
        // const { classes } = this.props;

        return <Grid container spacing={2}>
            <Grid item xs={12}>
                <Drain size={1}/>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
                <CardPool/>
            </Grid>
        </Grid>
    }
}

const mapStateToProps = state => ({
    ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(NewPools)));