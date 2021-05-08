// import {PublicKey, Connection} from '@solana/web3.js'
// import * as sb_abi from 'soprox-abi'
// import * as ssjs from 'senswapjs'
// import * as moment from 'moment';





// export const getTokenAccountsByOwner = async (ownerAddress, programId) => {
//     try {
//         const _ownerAddress = ssjs.account.fromAddress(ownerAddress)
//         console.log("ownerAddress", _ownerAddress)
//         const _programId = ssjs.account.fromAddress(programId)
//         console.log("programId", _programId)
//         const conn = getConnection()
//         const data = await conn.getTokenAccountsByOwner(_ownerAddress, {programId: _programId})
//         console.log("data", data)

//         let results = []
//         for (const d of data.value) {
//             const layout = new sb_abi.struct(ssjs.schema.ACCOUNT_SCHEMA);
//             layout.fromBuffer(d.account.data);
//             Object.assign(d.account, {data: layout.value})
//             results.push(d)
//         }
//         return results
//     } catch (error) {
//         console.log("exception error with message ", error)
//         throw new Error(error)
//     }
// }

// export const getAllTokenMintByOwner = async (ownerAddress, programId) => {
//     try {
//         const tokenAccounts = await getTokenAccountsByOwner(ownerAddress, programId)
//         const results = []
//         for (const tokenAccount of tokenAccounts) {
//             results.push(tokenAccount.account.data.mint)
//         }
//         return results
//     } catch (error) {
//         throw new Error(error)
//     }
// }

// export const getAllTransactionByTokenMint = async (ownerAddress) => {
// }

// export const getHistoryTokenTransaction = async (ownerAddress) => {
//     const conn = getConnection()
//     const programId = getProgramId()
//     const mints = await getAllTokenMintByOwner(ownerAddress, programId)
//     for (const mint of mints) {
//         const signatures = await conn.getConfirmedSignaturesForAddress2(new PublicKey(mint))
//         for (const s of signatures) {
//             const signature = s.signature
//             const data = await conn.getConfirmedTransaction(signature)
//             // console.log("****************")
//             console.log("data", data)
//             for (const instruction of data.transaction.instructions) {
//                 if (instruction.data === undefined || instruction.data.length == 0) continue
//                 const layout = new sb_abi.struct([{key: 'code', type: 'u8'}, {key: 'amount', type: 'u64'}]);
//                 layout.fromBuffer(instruction.data);
//                 console.log("instruction", layout.value)
//             }
//         }
//     }
// }