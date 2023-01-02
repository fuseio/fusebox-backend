import LiquidStakingABI from '@app/network-service/common/constants/abi/VoltBar.json'
import Erc20ABI from '@app/network-service/common/constants/abi/Erc20.json'
import ConsensusABI from '@app/network-service/common/constants/abi/Consensus.json'
import BlockRewardABI from '@app/network-service/common/constants/abi/BlockReward.json'
import TradeService from '@app/common/services/trade.service'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { aprToApy, encodeFunctionCall } from '@app/network-service/common/utils/helper-functions'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UnstakeDto } from '../dto/unstake.dto'
import { StakingOption, StakingProvider } from '../interfaces'
import { BigNumber } from 'ethers'
import { formatEther } from 'nestjs-ethers'

@Injectable()
export default class FuseLiquidStakingService implements StakingProvider {
  constructor (
        private readonly web3ProviderService: Web3ProviderService,
        private readonly configService: ConfigService,
        private readonly tradeService: TradeService
  ) {}

  get address () {
    return this.configService.get('fuseLiquidStakingAddress')
  }

  get sfTokenAddress () {
    return this.configService.get('sfTokenAddress')
  }

  get consensusAddress () {
    return this.configService.get('consensusAddress')
  }

  get blockRewardAddress () {
    return this.configService.get('blockRewardAddress')
  }

  get wfuseAddress () {
    return this.configService.get('wfuseAddress')
  }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  get contract () {
    return new this.web3Provider.eth.Contract(LiquidStakingABI as any, this.address)
  }

  get erc20Contract () {
    return new this.web3Provider.eth.Contract(Erc20ABI as any, this.sfTokenAddress)
  }

  get consensusContract () {
    return new this.web3Provider.eth.Contract(ConsensusABI as any, this.consensusAddress)
  }

  get blockRewardContract () {
    return new this.web3Provider.eth.Contract(BlockRewardABI as any, this.blockRewardAddress)
  }

  stake () {
    return encodeFunctionCall(
      LiquidStakingABI,
      this.web3Provider,
      'deposit',
      []
    )
  }

  unStake ({ tokenAmount }: UnstakeDto) {
    return encodeFunctionCall(
      LiquidStakingABI,
      this.web3Provider,
      'withdraw',
      [this.web3Provider.utils.toWei(tokenAmount)]
    )
  }

  async stakedToken (accountAddress: string, { tokenAddress, tokenLogoURI, tokenName, tokenSymbol }: StakingOption) {
    const priceRatio = await this.contract.methods.priceRatio().call()
    const sfBalance = await this.erc20Contract.methods.balanceOf(accountAddress).call()
    const stakedAmount = Number(formatEther(BigNumber.from(sfBalance).mul(priceRatio)))
    const fusePrice = await this.tradeService.getTokenPrice(this.configService.get('wfuseAddress'))
    const stakedAmountUSD = stakedAmount * fusePrice
    const earnedAmountUSD = 0

    return {
      tokenAddress,
      tokenLogoURI,
      tokenName,
      tokenSymbol,
      stakedAmount,
      stakedAmountUSD,
      earnedAmountUSD
    }
  }

  async stakingApr () {
    const validators = await this.consensusContract.methods.getValidators().call()
    const rewardPerBlock = await this.blockRewardContract.methods.getBlockRewardAmount().call()
    const blocksPerYear = await this.blockRewardContract.methods.getBlocksPerYear().call()

    const rewardPerValidator = Number(formatEther(rewardPerBlock)) / validators.length
    const rewardPerYearApr = rewardPerValidator * blocksPerYear
    return aprToApy(rewardPerYearApr, 365)
  }
}
