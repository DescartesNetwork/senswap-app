import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {withStyles} from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import {CardPool} from 'senswap-ui/card';

import styles from './styles';

import * as solana from '../../../helpers/solana'


class NewPools extends Component {

    componentDidMount() {
        solana.getTokenAccountsByOwner("")
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