import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotConfig } from '../../entities/bot-config.entity';
import { BotApiKeyGuard } from '../../common/guards/bot-api-key.guard';
import { BotConfigBotController } from './bot-config.bot.controller';
import { BotConfigController } from './bot-config.controller';
import { BotConfigService } from './bot-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([BotConfig])],
  controllers: [BotConfigController, BotConfigBotController],
  providers: [BotConfigService, BotApiKeyGuard],
})
export class BotConfigModule {}
