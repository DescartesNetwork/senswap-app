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
    _5_REVOKE: 5,
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

            for (const /*TransactionInstruction*/ txInstruction of instructions) {
                if (txInstruction.data.length === 0) continue
                if (txInstruction.programId.toString() !== configs.sol.spltAddress) continue
                const data = await parseInstructionv2(txInstruction)
                result.push(data)
            }
        }
        console.log("result", result)
    } catch (error) {
        throw new Error(error.message)
    }
}

export const getTokenWalletInfo = async (address) => {
    try {
        if ((typeof address) == "string") address = ssjs.account.fromAddress(address)
        console.log("address", address)
        const /*Connection*/ conn = getConnection()
        const acc = await conn.getAccountInfo(address)
        const layout = new sb_abi.struct(schema.ACCOUNT_SCHEMA);
        layout.fromBuffer(acc.data);
        return layout.value
    } catch (error) {
        throw new Error(error.message)
    }
}

export const parseInstructionv2 = async (instruction) => {
    try {
        const layout = new sb_abi.struct([
            {key: 'code', type: 'u8'},
            {key: 'amount', type: 'u64'}
        ]);
        layout.fromBuffer(instruction.data);
        const {code, amount} = layout.value

        switch (code) {
            case actionType._3_TRANSFER:
                const srcPublicKey = instruction.keys[0].pubkey.toString()
                const dstPublicKey = instruction.keys[1].pubkey.toString()
                const ownerPublicKey = instruction.keys[2].pubkey.toString()

                const srcAccountInfo = await getTokenWalletInfo(srcPublicKey)

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
            default:
                return
        }
    } catch (error) {
        throw new Error(error.message)
    }
}