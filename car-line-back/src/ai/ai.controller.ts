import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ProcessReceiptDto } from './dto/process-receipt.dto';
import { ReceiptResultDto } from './dto/receipt-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CarOwnershipGuard } from '../common/guards/car-ownership.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('process-receipt')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CarOwnershipGuard)
  async processReceipt(
    @Body() processReceiptDto: ProcessReceiptDto,
    @CurrentUser() user: any,
  ): Promise<ReceiptResultDto> {
    return this.aiService.processReceipt(processReceiptDto);
  }

  @Get('health')
  getHealth() {
    return this.aiService.getHealthStatus();
  }
}
