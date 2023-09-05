
export class ScannerStatusService {

  constructor (
    protected readonly statusModel,
    protected readonly statusFilter
  ) {
    
  }
  async getStatus () {
    const status = await this.statusModel.findOne({
      filter: this.statusFilter
    })

    if (status) {
      return status
    }

    const newStatus = await this.statusModel.create({
      filter: this.statusFilter
    })
    return newStatus
  }

  async updateStatus (blockNumber: number) {
    // await this.statusModel.updateOne({ filter: this.statusFilter }, { blockNumber }, { upsert: true })
  }

}