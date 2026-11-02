import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller.js';
import { CartsService } from './carts.service.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
