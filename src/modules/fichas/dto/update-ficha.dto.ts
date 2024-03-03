import { PartialType } from '@nestjs/swagger';
import { CreateFichaDto } from './create-ficha.dto';

export class UpdateFichaDto extends PartialType(CreateFichaDto) {}
