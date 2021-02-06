import {
  Account, Connection, PublicKey, Transaction,
  SystemProgram, sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';
import soproxABI from 'soprox-abi';
import ssjs from 'senswapjs';

import configs from 'configs';

/**
 * Main
 */
const SOL = {}

/**
 * Constants
 */
const ACCOUNT_SCHEMA = [
  { key: 'owner', type: 'pub' },
  { key: 'token', type: 'pub' },
  { key: 'amount', type: 'u64' },
  { key: 'initialized', type: 'bool' }
];
const TOKEN_SCHEMA = [
  { key: 'symbol', type: '[char;4]' },
  { key: 'total_supply', type: 'u64' },
  { key: 'decimals', type: 'u8' },
  { key: 'initialized', type: 'bool' }
];
const POOL_SCHEMA = [
  { key: 'token', type: 'pub' },
  { key: 'treasury', type: 'pub' },
  { key: 'reserve', type: 'u64' },
  { key: 'lpt', type: 'u64' },
  { key: 'fee_numerator', type: 'u64' },
  { key: 'fee_denominator', type: 'u64' },
  { key: 'initialized', type: 'bool' }
];
const LPT_SCHEMA = [
  { key: 'owner', type: 'pub' },
  { key: 'pool', type: 'pub' },
  { key: 'lpt', type: 'u64' },
  { key: 'initialized', type: 'bool' }
];

SOL.createConnection = () => {
  const { sol: { node } } = configs;
  const connection = new Connection(node, 'recent');
  return connection;
}

SOL.newToken = (symbol, totalSupply, decimals, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress } } = configs;
    const programId = ssjs.fromAddress(tokenFactoryAddress);
    const receiver = new Account();
    const token = new Account();
    const receiverSpace = (new soproxABI.struct(ACCOUNT_SCHEMA)).space;
    const tokenSpace = (new soproxABI.struct(TOKEN_SCHEMA)).space;
    return connection.getMinimumBalanceForRentExemption(receiverSpace).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: receiver.publicKey,
        lamports,
        space: receiverSpace,
        programId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, receiver],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      return connection.getMinimumBalanceForRentExemption(tokenSpace);
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: token.publicKey,
        lamports,
        space: tokenSpace,
        programId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, token],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const layout = new soproxABI.struct(
        [
          { key: 'code', type: 'u8' },
          { key: 'symbol', type: '[char;4]' },
          { key: 'totalSupply', type: 'u64' },
          { key: 'decimals', type: 'u8' },
        ],
        { code: 0, symbol, totalSupply, decimals });
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: token.publicKey, isSigner: true, isWritable: true },
          { pubkey: receiver.publicKey, isSigner: true, isWritable: true },
        ],
        programId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection,
        transaction,
        [payer, token, receiver],
        { skipPreflight: true, commitment: 'recent', });
    }).then(txId => {
      return resolve({ token, receiver, txId });
    }).catch(er => {
      console.error(er);
      return reject('Cannot deploy a new token');
    });
  });
}

SOL.newSRC20Account = (tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress } } = configs;
    const programId = ssjs.fromAddress(tokenFactoryAddress);
    const account = new Account();
    const space = (new soproxABI.struct(ACCOUNT_SCHEMA)).space;
    return connection.getMinimumBalanceForRentExemption(space).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: account.publicKey,
        lamports,
        space,
        programId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, account],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const layout = new soproxABI.struct(
        [{ key: 'code', type: 'u8' }],
        { code: 1, }
      );
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: account.publicKey, isSigner: true, isWritable: true },
        ],
        programId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer, account],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(account);
    }).catch(er => {
      console.error(er);
      return reject('Cannot create a SRC20 account');
    });
  });
}

SOL.newLPTAccount = (payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { swapFactoryAddress } } = configs;
    const swapProgramId = ssjs.fromAddress(swapFactoryAddress);
    let lpt = new Account();
    const lptSpace = (new soproxABI.struct(LPT_SCHEMA)).space;
    return connection.getMinimumBalanceForRentExemption(lptSpace).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: lpt.publicKey,
        lamports,
        space: lptSpace,
        programId: swapProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, lpt],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      return resolve(lpt);
    }).catch(er => {
      console.error(er);
      return reject('Cannot create an LPT account');
    });
  });
}

SOL.newPool = (reserve, stable, srcTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = ssjs.fromAddress(tokenFactoryAddress);
    const swapProgramId = ssjs.fromAddress(swapFactoryAddress);
    let pool = null;
    let treasury = new Account();
    let lpt = new Account();
    const poolSpace = (new soproxABI.struct(POOL_SCHEMA)).space;
    const treasurySpace = (new soproxABI.struct(ACCOUNT_SCHEMA)).space;
    const lptSpace = (new soproxABI.struct(LPT_SCHEMA)).space;
    return ssjs.createStrictAccount(swapProgramId).then(re => {
      pool = re;
      // Create accounts
      return connection.getMinimumBalanceForRentExemption(poolSpace)
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: pool.publicKey,
        lamports,
        space: poolSpace,
        programId: swapProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, pool],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      return connection.getMinimumBalanceForRentExemption(treasurySpace);
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: treasury.publicKey,
        lamports,
        space: treasurySpace,
        programId: tokenProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, treasury],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      return connection.getMinimumBalanceForRentExemption(lptSpace);
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: lpt.publicKey,
        lamports,
        space: lptSpace,
        programId: swapProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, lpt],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const seed = [pool.publicKey.toBuffer()];
      return PublicKey.createProgramAddress(seed, swapProgramId);
    }).then(tokenOwnerPublicKey => {
      const layout = new soproxABI.struct(
        [
          { key: 'code', type: 'u8' },
          { key: 'reserve', type: 'u64' },
          { key: 'lpt', type: 'u64' },
        ],
        { code: 0, reserve, lpt: stable }
      );
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: pool.publicKey, isSigner: true, isWritable: true },
          { pubkey: treasury.publicKey, isSigner: true, isWritable: true },
          { pubkey: lpt.publicKey, isSigner: true, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer, pool, treasury, lpt],
        { skipPreflight: true, commitment: 'recent', });
    }).then(txId => {
      return resolve({ pool, treasury, lpt, txId });
    }).catch(er => {
      console.error(er);
      return reject('Cannot create a pool or a treasury account');
    });
  });
}

SOL.addLiquidityWithNewLPTAccount = (reserve, poolPublicKey, treasuryPublicKey, lptAccount, srcTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = ssjs.fromAddress(tokenFactoryAddress);
    const swapProgramId = ssjs.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'reserve', type: 'u64' },
      ],
      { code: 1, reserve }
    );
    const seed = [poolPublicKey.toBuffer()];
    return PublicKey.createProgramAddress(seed, swapProgramId).then(tokenOwnerPublicKey => {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: poolPublicKey, isSigner: false, isWritable: true },
          { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
          { pubkey: lptAccount.publicKey, isSigner: true, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer, lptAccount],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(re);
    }).catch(er => {
      console.error(er);
      return reject('Cannot add liquidity to the pool');
    });;
  });
}

SOL.addLiquidity = (reserve, poolPublicKey, treasuryPublicKey, lptPublicKey, srcTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = ssjs.fromAddress(tokenFactoryAddress);
    const swapProgramId = ssjs.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'reserve', type: 'u64' },
      ],
      { code: 1, reserve }
    );
    const seed = [poolPublicKey.toBuffer()];
    return PublicKey.createProgramAddress(seed, swapProgramId).then(tokenOwnerPublicKey => {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: poolPublicKey, isSigner: false, isWritable: true },
          { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
          { pubkey: lptPublicKey, isSigner: false, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(re);
    }).catch(er => {
      console.error(er);
      return reject('Cannot add liquidity to the pool');
    });;
  });
}

SOL.removeLiquidity = (lpt, poolPublicKey, treasuryPublicKey, lptPublickey, dstTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = ssjs.fromAddress(tokenFactoryAddress);
    const swapProgramId = ssjs.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'lpt', type: 'u64' },
      ],
      { code: 2, lpt }
    );
    const seed = [poolPublicKey.toBuffer()];
    return PublicKey.createProgramAddress(seed, swapProgramId).then(tokenOwnerPublicKey => {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: poolPublicKey, isSigner: false, isWritable: true },
          { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
          { pubkey: lptPublickey, isSigner: false, isWritable: true },
          { pubkey: dstTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(re);
    }).catch(er => {
      console.error(er);
      return reject('Cannot withdraw liquidity to the pool');
    })
  });
}

SOL.swap = (
  amount,
  payer,
  bidPoolPublicKey,
  bidTreasuryPublicKey,
  srcTokenPublickKey,
  bidTokenPublickKey,
  askPoolPublicKey,
  askTreasuryPublickKey,
  dstTokenPublickKey,
  askTokenPublicKey,
) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = ssjs.fromAddress(tokenFactoryAddress);
    const swapProgramId = ssjs.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'amount', type: 'u64' },
      ],
      { code: 3, amount }
    );
    const seed = [askPoolPublicKey.toBuffer()];
    return PublicKey.createProgramAddress(seed, swapProgramId).then(askTokenOwnerPublicKey => {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: bidPoolPublicKey, isSigner: false, isWritable: true },
          { pubkey: bidTreasuryPublicKey, isSigner: false, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: bidTokenPublickKey, isSigner: false, isWritable: false },
          { pubkey: askPoolPublicKey, isSigner: false, isWritable: true },
          { pubkey: askTreasuryPublickKey, isSigner: false, isWritable: true },
          { pubkey: dstTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: askTokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: askTokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(re);
    }).catch(er => {
      console.error(er);
      return reject('Cannot swap');
    })
  });
}

export default SOL;