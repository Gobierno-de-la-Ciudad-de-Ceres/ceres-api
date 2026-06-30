import { Controller, Get, UseGuards } from '@nestjs/common';
import { BotApiKeyGuard } from '../../common/guards/bot-api-key.guard';
import { BotConfigService } from './bot-config.service';

@UseGuards(BotApiKeyGuard)
@Controller({ path: 'config/bot', version: '1' })
export class BotConfigBotController {
  constructor(private readonly service: BotConfigService) {}

  @Get('bienvenida')
  getMensajesBienvenidaActivos() {
    return this.service.getMensajesBienvenidaActivos();
  }
}
