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

import { FlightTakeoffRounded, FlightLandRounded, HistoryRounded } from 'senswap-ui/icons';

import Price from './price';
import { AccountSelection, AccountSend, AccountReceive } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';


class Info extends Component {
	constructor() {
		super();

		this.state = {
			mark: 'send',
			accountData: {},
			visibleAccountSelection: false,
			visibleAccountSend: false,
			visibleAccountReceive: false,
		}

		this.wallet = window.senswap.wallet;
		this.splt = window.senswap.splt;
		this.lamports = window.senswap.lamports;
	}

	transfer = (amount, from, to) => {
		if (!from) {
			amount = amount.toString();
			return this.lamports.transfer(amount, to, this.wallet);
		}
		return this.splt.transfer(amount, from, to, this.wallet);
	}

	onCloseAccountSelection = () => this.setState({ visibleAccountSelection: false });
	onOpenAccountSelection = (mark) => this.setState({ mark, visibleAccountSelection: true });
	onAccountData = (accountData) => {
		const { mark } = this.state;
		return this.setState({ accountData }, () => {
			if (mark === 'send') this.onOpenAccountSend();
			if (mark === 'receive') this.onOpenAccountReceive();
			return this.onCloseAccountSelection();
		});
	}

	onCloseAccountSend = () => this.setState({ visibleAccountSend: false });
	onOpenAccountSend = () => this.setState({ visibleAccountSend: true });
	onTransactionData = ({ amount, from, to }) => {
		const { setError } = this.props;
		return this.transfer(amount, from, to).then(txId => {
			console.log(txId);
			return this.onCloseAccountSend();
		}).catch(er => {
			this.onCloseAccountSend();
			return setError(er);
		});
	}

	onCloseAccountReceive = () => this.setState({ visibleAccountReceive: false });
	onOpenAccountReceive = () => this.setState({ visibleAccountReceive: true });

	render() {
		const { classes } = this.props;
		const { wallet: { lamports } } = this.props;
		const { accountData, visibleAccountSelection, visibleAccountSend, visibleAccountReceive } = this.state;

		return <Paper className={classes.paper}>
			<Grid container spacing={1}>
				<Grid item xs={12}>
					<Grid container className={classes.noWrap}>
						<Grid item className={classes.stretch}>
							<Typography variant="h6">Total Balance</Typography>
						</Grid>
						<Grid item>
							<Button startIcon={<HistoryRounded color="disabled" />}>
								<Typography variant="body2" color="textSecondary">History</Typography>
							</Button>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Grid container alignItems="center" className={classes.noWrap}>
						<Grid item>
							<Typography variant="h2">{utils.prettyNumber(ssjs.undecimalize(lamports, 9))}</Typography>
						</Grid>
						<Grid item className={classes.stretch}>
							<Chip label="SOL" classes={{ root: classes.chip }} />
						</Grid>
						<Grid item>
							<Button
								variant="contained"
								color="primary"
								startIcon={<FlightTakeoffRounded />}
								size="large"
								onClick={() => this.onOpenAccountSelection('send')}
							>
								<Typography>Send</Typography>
							</Button>
						</Grid>
						<Grid item>
							<Button
								variant="outlined"
								startIcon={<FlightLandRounded />}
								size="large"
								onClick={() => this.onOpenAccountSelection('receive')}
							>
								<Typography>Receive</Typography>
							</Button>
						</Grid>
						<AccountSelection
							visible={visibleAccountSelection}
							onClose={this.onCloseAccountSelection}
							onChange={this.onAccountData}
						/>
						<AccountSend
							visible={visibleAccountSend}
							data={accountData}
							onClose={this.onCloseAccountSend}
							onSend={this.onTransactionData}
						/>
						<AccountReceive
							visible={visibleAccountReceive}
							data={accountData}
							onClose={this.onCloseAccountReceive}
						/>
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Price amount={parseFloat(ssjs.undecimalize(lamports, 9))} ticket="solana" />
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
	setError,
}, dispatch);

export default withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(Info)));