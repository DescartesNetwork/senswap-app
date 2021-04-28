import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Paper from 'senswap-ui/paper';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Chip from 'senswap-ui/chip';

import { FlightTakeoffRounded, FlightLandRounded } from 'senswap-ui/icons';

import Price from './price';

import styles from './styles';
import utils from 'helpers/utils';


class Info extends Component {

	render() {
		const { classes } = this.props;
		const { wallet: { lamports } } = this.props;

		return <Paper className={classes.paper}>
			<Grid container justify="space-between" className={classes.noWrap}>
				<Grid item>
					<Grid container>
						<Grid item xs={12}>
							<Typography variant="h6">Total Balance</Typography>
						</Grid>
						<Grid item xs={12}>
							<Grid container alignItems="center">
								<Grid item>
									<Typography variant="h2">{utils.prettyNumber(ssjs.undecimalize(lamports, 9))}</Typography>
								</Grid>
								<Grid item>
									<Chip label="SOL" classes={{ root: classes.chip }} />
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={12}>
							<Price amount={parseFloat(ssjs.undecimalize(lamports, 9))} ticket="solana" />
						</Grid>
					</Grid>
				</Grid>
				<Grid item>
					<Grid container justify="flex-end" className={classes.noWrap}>
						<Grid item>
							<Button
								variant="contained"
								color="primary"
								startIcon={<FlightTakeoffRounded />}
								size="large"
							>
								<Typography>Send</Typography>
							</Button>
						</Grid>
						<Grid item>
							<Button
								variant="outlined"
								startIcon={<FlightLandRounded />}
								size="large"
							>
								<Typography>Receive</Typography>
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Paper>
	}
}

const mapStateToProps = state => ({
	ui: state.ui,
	wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch);

export default withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(Info)));