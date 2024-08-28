export interface Stat {
  priceUSD: string
  volumeUSD: string
  date: number
}

export enum TimeFrame {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
  WEEK = 'WEEK',
}

export class TokenStat {
  public readonly date: Date

  constructor (
    public readonly address: string,
    public readonly price: string,
    public readonly volume: string,
    public readonly timestamp: number
  ) {
    this.date = new Date(timestamp * 1000)
  }
}
