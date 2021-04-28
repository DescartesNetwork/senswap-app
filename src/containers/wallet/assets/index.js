import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import Favorite from 'senswap-ui/favorite';
import Avatar from 'senswap-ui/avatar';

import { } from 'senswap-ui/icons';

import styles from './styles';


class Assets extends Component {

	render() {
		const { classes } = this.props;

		return <Grid container>
			<Grid item xs={12}>
				<Typography variant="subtitle1">Asset Balances</Typography>
			</Grid>
			<Grid item xs={12}>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell />
								<TableCell>
									<Typography variant="caption">ASSET</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="caption">SYMBOL</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="caption">24H MARKET</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="caption">TOTAL BALANCE</Typography>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell >
									<Favorite />
								</TableCell>
								<TableCell>
									<Grid container className={classes.noWrap} alignItems="center">
										<Grid item>
											<Avatar />
										</Grid>
										<Grid item>
											<Typography>Bitcoin</Typography>
										</Grid>
									</Grid>
								</TableCell>
								<TableCell>
									<Typography>BTC</Typography>
								</TableCell>
								<TableCell>
									<Typography>2.05</Typography>
								</TableCell>
								<TableCell>
									<Typography>$123819273</Typography>
									<Typography variant="body2" color="textSecondary">$123.12</Typography>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			</Grid>
		</Grid>
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
)(withStyles(styles)(Assets)));