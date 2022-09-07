import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TransferService } from '@app/network-service/transfer/transfer.service';
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto';

@Controller('transfer')
export class TransferController {
    constructor(private readonly transferService: TransferService) { }
    @MessagePattern('transferPost')
    transferPost(transferDto: TransferDto) {
        return this.transferService.transferPost(transferDto)
    }
}
