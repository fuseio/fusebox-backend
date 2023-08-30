import * as mongoose from 'mongoose'
export const WalletActionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        walletAddress: { type: String, required: true },
        userOpHash: { type: String, required: true, default: '0x' },
        action: { type: Object, required: false, default: {} },
        status: { type: String, required: true, default: false },
    }
    ,
    {
        timestamps: true
    }
)
// const mongoosePaginate = require('mongoose-paginate-v2')
// const TransactionStatuses = require('apps/charge-smart-wallets-service/src/common/utils/transactionStatuses')
// const { Schema } = mongoose

// const WalletActionSchema = new Schema({
//     name: { type: String, required: [true, "can't be blank"] },
//     walletAddress: { type: String },
//     tokenAddress: [{ type: String }],
//     data: { type: Object, default: {} },
//     status: { type: String, default: 'pending' },
//     failedAt: { type: Date },
//     failReason: { type: String }
// }, { timestamps: true })

// WalletActionSchema.index({ walletAddress: 1 })
// WalletActionSchema.index({ tokenAddress: 1 })
// WalletActionSchema.plugin(mongoosePaginate)

// WalletActionSchema.methods.fail = function (reason) {
//     if (reason instanceof Error) {
//         reason = reason.message
//     }
//     this.failReason = reason
//     this.failedAt = Date.now()
//     this.status = TransactionStatuses.FAILED
// }

// WalletActionSchema.methods.failAndUpdate = function (reason) {
//     if (reason instanceof Error) {
//         reason = reason.message
//     }
//     return WalletAction.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now(), failedAt: Date.now(), status: TransactionStatuses.FAILED, failReason: reason })
// }

// WalletActionSchema.methods.successAndUpdate = function () {
//     if (this.status === TransactionStatuses.STARTED) {
//         return WalletAction.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now(), status: TransactionStatuses.SUCCEEDED })
//     } else {
//         console.warn(`calling successAndUpdate on message with status ${this.status}`)
//         return WalletAction.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now() })
//     }
// }

// const WalletAction = mongoose.model('WalletAction', WalletActionSchema)

// module.exports = WalletAction
