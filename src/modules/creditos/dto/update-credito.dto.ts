import { PartialType } from '@nestjs/swagger';
import { CreateCreditoDto } from './create-credito.dto';

export class UpdateCreditoDto extends PartialType(CreateCreditoDto) {}