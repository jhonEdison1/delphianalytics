import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credito } from './entities/credito.entity';
import { CreditosController } from './creditos.controller';
import { CreditosService } from './creditos.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Credito]),
    ],
    controllers: [CreditosController],
    providers: [CreditosService],
})
export class CreditosModule {}
