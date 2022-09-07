import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard';
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TransferApiService } from '@app/api-service/network/transfer-api/transfer-api.service';


// @UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/transfers')
export class TransferApiController {
    constructor(private readonly transferService: TransferApiService) { }

    @Post('/*')
    transferPost(@Body() transferDto: TransferDto) {
        return this.transferService.transferPost(transferDto)
    }
    // @Get('/*')
    // get(){
    //     return this.transferService.get()
    // }
}