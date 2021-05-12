import * as sb_abi from 'soprox-abi'
import * as ssjs from 'senswapjs'
import {Connection, ConfirmedTransaction, PublicKey} from "@solana/web3.js";
import configs from "../configs";
import * as schema from "senswapjs";

let connection = null

export const getConnection = () => {
    if (connection === undefined || connection == null) {
        return new Connection('https://devnet.solana.com/')
    }
    return connection
}

const actionType = {
    _0_INITIALIZE_MINT: 0,
    _1_INITIALIZE_ARBITRARY_ACCOUNT: 1,
    _2_INITIALIZE_MULTI_SIG: 2,
    _3_TRANSFER: 3,
    _4_APPROVE: 4,
    _5_THAW_POOL: 5,
    _6_SET_AUTHORITY: 6,
    _7_MINT_TO: 7,
    _8_BURN: 8,
    _9_CLOSE_ACCOUNT: 9,
    _10_FREEZE_ACCOUNT: 10,
    _10_THAW_ACCOUNT: 11,
}

/**
 *
 * @param timeFrom
 * @param timeTo
 * @returns {Promise<void>}
 */
export const findAllTransactionByTime = async (address, timeFrom, timeTo) => {
    try {
        const addr = ssjs.account.fromAddress(address)

        const signatures = []
        let isContinue = true
        let signature = ""
        while (isContinue) {
            let options = {limit: 50}
            if (signature !== "") {
                options = {limit: 50, before: signature}
            }
            const transactions = await getConnection().getConfirmedSignaturesForAddress2(addr, options)
            for (const tx of transactions) {
                const blockTime = tx.blockTime * 1000
                if (blockTime > timeTo) continue
                if (blockTime < timeFrom) {
                    isContinue = false
                    break
                }
                signature = tx.signature
                signatures.push(signature)
            }
        }

        const result = []
        for (const s of signatures) {
            const /*ConfirmedTransaction*/ confirmedTx = await getConnection().getConfirmedTransaction(s)
            if (confirmedTx == null) continue
            const instructions = confirmedTx.transaction.instructions
            console.log("instructions", instructions)

            for (const /*TransactionInstruction*/ txInstruction of instructions) {
                if (txInstruction.data.length === 0) continue

                const programId = txInstruction.programId.toString()
                if (programId !== "BVK3vduDFLbPouYBPBd8gpKjHSaj88mN2aTMbjQaXPda") {
                    console.log(`program id not matching, program on app [${configs.sol.spltAddress}], program receive [${programId}]`)
                    continue
                }

                const data = await parseInstruction(txInstruction)
                console.log("data", data)
                result.push(data)
            }
        }
        console.log("result", result)
    } catch (error) {
        throw new Error(error.message)
    }
}

export const parseInstruction = async (instruction) => {
    try {
        const layout = new sb_abi.struct([
            {key: 'code', type: 'u8'},
            {key: 'amount', type: 'u64'}
        ]);
        layout.fromBuffer(instruction.data);
        const {code, amount} = layout.value
        console.log(`code [${code}], amount [${amount}]`)

        let srcPublicKey
        let srcAccountInfo
        let dstPublicKey
        let dstAccountInfo
        let ownerPublicKey
        switch (code) {
            case actionType._3_TRANSFER:
                srcPublicKey = instruction.keys[0].pubkey.toString()
                srcAccountInfo = await getTokenWalletInfo(srcPublicKey)
                dstPublicKey = instruction.keys[1].pubkey.toString()
                ownerPublicKey = instruction.keys[2].pubkey.toString()
                return {
                    amount: amount,
                    type: actionType._3_TRANSFER,
                    accounts: {
                        source: srcPublicKey,
                        destination: dstPublicKey,
                        owner: ownerPublicKey,
                    },
                    mint: srcAccountInfo.mint,
                }
            case actionType._5_THAW_POOL:
                ownerPublicKey = instruction.keys[0].pubkey.toString()
                srcPublicKey = instruction.keys[4].pubkey.toString()
                srcAccountInfo = await getTokenWalletInfo(srcPublicKey)
                dstPublicKey = instruction.keys[7].pubkey.toString()
                dstAccountInfo = await getTokenWalletInfo(dstPublicKey)
                return {
                    amount: amount,
                    type: actionType._5_THAW_POOL,
                    accounts: {
                        source: srcPublicKey,
                        destination: dstPublicKey,
                        owner: ownerPublicKey,
                    },
                    mint_from: srcAccountInfo.mint,
                    mint_to: dstAccountInfo.mint,
                }
            default:
                const accounts = []
                instruction.keys.map(/*AccountMeta*/accountMeta => {
                    accounts.push(accountMeta.pubkey.toString())
                })
                return {
                    accounts: accounts
                }
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

export const getTokenWalletInfo = async (address) => {
    try {
        if ((typeof address) == "string") address = ssjs.account.fromAddress(address)
        const /*Connection*/ conn = getConnection()
        const /*AccountInfo<Buffer>*/ acc = await conn.getAccountInfo(address)
        const layout = new sb_abi.struct(schema.ACCOUNT_SCHEMA);
        layout.fromBuffer(acc.data);
        return layout.value
    } catch (error) {
        throw new Error(error.message)
    }
}