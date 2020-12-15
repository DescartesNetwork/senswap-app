import {
  Account, Connection, PublicKey, Transaction,
  LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';
import soproxABI from 'soprox-abi';

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

SOL.fromSecretKey = (secretKey) => {
  const account = new Account(Buffer.from(secretKey, 'hex'));
  return account;
}

SOL.fromAddress = (address) => {
  const publicKey = new PublicKey(address);
  return publicKey;
}

SOL.createConnection = () => {
  const { sol: { node } } = configs;
  const connection = new Connection(node, 'recent');
  return connection;
}

SOL.getBalance = (address) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const publicKey = SOL.fromAddress(address);
    return connection.getBalance(publicKey).then(re => {
      return resolve(re / LAMPORTS_PER_SOL);
    }).catch(er => {
      return reject(er);
    });
  })
}

SOL.getTokenData = (accountAddress) => {
  return new Promise((resolve, reject) => {
    if (!accountAddress) return reject('Invalid public key');
    const connection = SOL.createConnection();
    let result = {
      address: accountAddress,
    }
    return connection.getAccountInfo(SOL.fromAddress(accountAddress)).then(({ data: accountData }) => {
      if (!accountData) return reject(`Cannot find data of ${result.address}`);
      const accountLayout = new soproxABI.struct(ACCOUNT_SCHEMA);
      accountLayout.fromBuffer(accountData);
      let token = { address: accountLayout.value.token };
      result = { ...result, ...accountLayout.value, token };
      return connection.getAccountInfo(SOL.fromAddress(result.token.address));
    }).then(({ data: tokenData }) => {
      if (!tokenData) return reject(`Cannot find data of ${result.token.address}`);
      const tokenLayout = new soproxABI.struct(TOKEN_SCHEMA);
      tokenLayout.fromBuffer(tokenData);
      result.token = { ...result.token, ...tokenLayout.value };
      return resolve(result);
    }).catch(er => {
      return reject('Cannot read data');
    });
  });
}

SOL.getTokenAccountData = (address) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const accountSchema = [
      { key: 'owner', type: 'pub' },
      { key: 'token', type: 'pub' },
      { key: 'amount', type: 'u64' },
      { key: 'initialized', type: 'bool' }
    ];
    const tokenSchema = [
      { key: 'symbol', type: '[char;4]' },
      { key: 'total_supply', type: 'u64' },
      { key: 'decimals', type: 'u8' },
      { key: 'initialized', type: 'bool' }
    ];
    const accountPublicKey = SOL.fromAddress(address);
    return connection.getAccountInfo(accountPublicKey).then(({ data: accountData }) => {
      if (!accountData) return reject(`Cannot find data of ${address}`);
      const accountLayout = new soproxABI.struct(accountSchema);
      accountLayout.fromBuffer(accountData);
      const accountValue = { ...accountLayout.value };

      return connection.getAccountInfo(SOL.fromAddress(accountValue.token)).then(({ data: tokenData }) => {
        if (!tokenData) return reject(`Cannot find data of ${accountValue.token}`);
        const tokenLayout = new soproxABI.struct(tokenSchema);
        tokenLayout.fromBuffer(tokenData);
        const tokenValue = { ...tokenLayout.value };
        return resolve({ ...accountValue, ...tokenValue });
      }).catch(er => {
        return reject('Cannot read the token data');
      });
    }).catch(er => {
      return reject('Cannot read the account data');
    });
  });
}

SOL.getPoolAccountData = (address) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const poolSchema = [
      { key: 'token', type: 'pub' },
      { key: 'treasury', type: 'pub' },
      { key: 'reserve', type: 'u64' },
      { key: 'sen', type: 'u64' },
      { key: 'fee_numerator', type: 'u64' },
      { key: 'fee_denominator', type: 'u64' },
      { key: 'initialized', type: 'bool' }
    ];
    const poolPublicKey = SOL.fromAddress(address);
    return connection.getAccountInfo(poolPublicKey).then(({ data: poolData }) => {
      if (!poolData) return reject(`Cannot find data of ${address}`);
      const poolLayout = new soproxABI.struct(poolSchema);
      poolLayout.fromBuffer(poolData);
      const poolValue = { ...poolLayout.value };
      return resolve({ ...poolValue });
    }).catch(er => {
      return reject('Cannot read the pool data');
    });
  });
}

SOL.getSenAccountData = (address) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const senSchema = [
      { key: 'owner', type: 'pub' },
      { key: 'pool', type: 'pub' },
      { key: 'sen', type: 'u64' },
      { key: 'initialized', type: 'bool' }
    ];
    const senPublicKey = SOL.fromAddress(address);
    return connection.getAccountInfo(senPublicKey).then(({ data: senData }) => {
      if (!senData) return reject(`Cannot find data of ${address}`);
      const senLayout = new soproxABI.struct(senSchema);
      senLayout.fromBuffer(senData);
      const senValue = { ...senLayout.value };
      return resolve({ ...senValue });
    }).catch(er => {
      return reject('Cannot read the sen data');
    });
  });
}

SOL.newSRC20Account = (tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress } } = configs;
    const programId = SOL.fromAddress(tokenFactoryAddress);
    const account = new Account();
    const accountSchema = [
      { key: 'owner', type: 'pub' },
      { key: 'token', type: 'pub' },
      { key: 'amount', type: 'u64' },
      { key: 'initialized', type: 'bool' }
    ];
    const space = (new soproxABI.struct(accountSchema)).space;
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
      return reject('Cannot create a SRC20 account');
    });
  });
}

SOL.newPoolAndTreasuryAccount = (reserve, stable, srcTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = SOL.fromAddress(tokenFactoryAddress);
    const swapProgramId = SOL.fromAddress(swapFactoryAddress);
    // Pool
    const pool = new Account();
    const poolSchema = [
      { key: 'token', type: 'pub' },
      { key: 'treasury', type: 'pub' },
      { key: 'reserve', type: 'u64' },
      { key: 'sen', type: 'u64' },
      { key: 'fee_numerator', type: 'u64' },
      { key: 'fee_denominator', type: 'u64' },
      { key: 'initialized', type: 'bool' }
    ];
    // Treasury
    const treasury = new Account();
    const treasurySchema = [
      { key: 'owner', type: 'pub' },
      { key: 'token', type: 'pub' },
      { key: 'amount', type: 'u64' },
      { key: 'initialized', type: 'bool' }
    ];
    // Sen
    const sen = new Account();
    const senSchema = [
      { key: 'owner', type: 'pub' },
      { key: 'pool', type: 'pub' },
      { key: 'sen', type: 'u64' },
      { key: 'initialized', type: 'bool' }
    ];
    const poolSpace = (new soproxABI.struct(poolSchema)).space;
    const treasurySpace = (new soproxABI.struct(treasurySchema)).space;
    const senSpace = (new soproxABI.struct(senSchema)).space;
    //Create accounts
    return connection.getMinimumBalanceForRentExemption(poolSpace).then(lamports => {
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
      return connection.getMinimumBalanceForRentExemption(senSpace);
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: sen.publicKey,
        lamports,
        space: senSpace,
        programId: swapProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, sen],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const layout = new soproxABI.struct(
        [
          { key: 'code', type: 'u8' },
          { key: 'reserve', type: 'u64' },
          { key: 'sen', type: 'u64' },
        ],
        { code: 0, reserve, sen: stable }
      );
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: pool.publicKey, isSigner: true, isWritable: true },
          { pubkey: treasury.publicKey, isSigner: true, isWritable: true },
          { pubkey: sen.publicKey, isSigner: true, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer, pool, treasury, sen],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve({ pool, treasury, sen });
    }).catch(er => {
      return reject('Cannot create a pool or a treasury account');
    });
  });
}

SOL.addLiquidity = (reserve, poolPublicKey, treasuryPublicKey, srcTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = SOL.fromAddress(tokenFactoryAddress);
    const swapProgramId = SOL.fromAddress(swapFactoryAddress);
    // Sen
    const sen = new Account();
    const senSchema = [
      { key: 'owner', type: 'pub' },
      { key: 'pool', type: 'pub' },
      { key: 'sen', type: 'u64' },
      { key: 'initialized', type: 'bool' }
    ];
    const senSpace = (new soproxABI.struct(senSchema)).space;
    return connection.getMinimumBalanceForRentExemption(senSpace).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: sen.publicKey,
        lamports,
        space: senSpace,
        programId: swapProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, sen],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const layout = new soproxABI.struct(
        [
          { key: 'code', type: 'u8' },
          { key: 'reserve', type: 'u64' },
        ],
        { code: 1, reserve }
      );
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: poolPublicKey, isSigner: false, isWritable: true },
          { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
          { pubkey: sen.publicKey, isSigner: true, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer, sen],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(sen);
    }).catch(er => {
      return reject('Cannot add liquidity to the pool');
    });
  });
}

SOL.withdrawLiquidity = (sen, poolPublicKey, treasuryPublicKey, senPublickey, dstTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = SOL.fromAddress(tokenFactoryAddress);
    const swapProgramId = SOL.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'sen', type: 'u64' },
      ],
      { code: 2, sen }
    );
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: false },
        { pubkey: poolPublicKey, isSigner: false, isWritable: true },
        { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
        { pubkey: senPublickey, isSigner: false, isWritable: true },
        { pubkey: dstTokenPublickKey, isSigner: false, isWritable: true },
        { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
        { pubkey: tokenProgramId, isSigner: false, isWritable: false },
      ],
      programId: swapProgramId,
      data: layout.toBuffer()
    });
    const transaction = new Transaction();
    transaction.add(instruction);
    return sendAndConfirmTransaction(
      connection, transaction, [payer],
      { skipPreflight: true, commitment: 'recent', }).then(re => {
        return resolve(sen);
      }).catch(er => {
        return reject('Cannot withdraw liquidity to the pool');
      });
  });
}

export default SOL;