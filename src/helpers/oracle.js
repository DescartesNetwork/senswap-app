import ssjs from 'senswapjs';

const Oracle = {}

Oracle.curve = (bidAmount, bidData, askData) => {
  if (!bidAmount || typeof bidAmount !== 'bigint') return { error: 'Invalid bid amount', data: null };
  if (!bidData) return { error: 'Invalid bid pool data', data: null };
  if (!askData) return { error: 'Invalid ask pool data', data: null };
  if (bidData.state !== 1) return { error: 'Frozen bid pool', data: null };
  if (askData.state !== 1) return { error: 'Frozen ask pool', data: null };

  // Parse data
  const {
    network: { address: bidAddressNetwork },
    reserve: bidReserve, lpt: bidLPT
  } = bidData;
  const {
    network: { address: askAddressNetwork, primary: askPrimaryAddress },
    mint: { address: askMintAddress },
    reserve: askReserve, lpt: askLPT
  } = askData;

  // Fee
  if (bidAddressNetwork !== askAddressNetwork) return { error: 'Unsupported routing', data: null };
  const fee = askPrimaryAddress === askMintAddress ? global.BigInt(2500000) : global.BigInt(3000000);

  const newBidReserve = bidReserve + bidAmount;
  const newAskReserve = ssjs.curve(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
  const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
  const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
  const paidAmountWithoutFee = askReserve - newAskReserve;
  const amount = paidAmountWithoutFee * (global.BigInt(10 ** 9) - fee) / global.BigInt(10 ** 9);
  return { error: null, data: { slippage, ratio, amount, fee } };
}

Oracle.inverseCurve = (askAmount, bidData, askData) => {
  if (!askAmount || typeof askAmount !== 'bigint') return { error: 'Invalid ask amount', data: null };
  if (!bidData) return { error: 'Invalid bid pool data', data: null };
  if (!askData) return { error: 'Invalid ask pool data', data: null };
  if (bidData.state !== 1) return { error: 'Frozen bid pool', data: null };
  if (askData.state !== 1) return { error: 'Frozen ask pool', data: null };

  // Parse data
  const {
    network: { address: bidAddressNetwork },
    reserve: bidReserve, lpt: bidLPT
  } = bidData;
  const {
    network: { address: askAddressNetwork, primary: askPrimaryAddress },
    mint: { address: askMintAddress },
    reserve: askReserve, lpt: askLPT
  } = askData;

  // Fee
  if (bidAddressNetwork !== askAddressNetwork) return { error: 'Unsupported routing', data: null };
  const fee = askPrimaryAddress === askMintAddress ? global.BigInt(2500000) : global.BigInt(3000000);

  const askAmountWithoutFee = askAmount * global.BigInt(10 ** 9) / (global.BigInt(10 ** 9) - fee);
  const newAskReserve = askReserve - askAmountWithoutFee;
  const newBidReserve = ssjs.inverseCurve(newAskReserve, bidReserve, bidLPT, askReserve, askLPT);
  const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
  const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
  const amount = newBidReserve - bidReserve;
  return { error: null, data: { slippage, ratio, amount, fee } };
}


export default Oracle;