import { PartialType } from '@nestjs/swagger';
import { CreateSubtituloDto } from './create-subtitulo.dto';

export class UpdateSubtituloDto extends PartialType(CreateSubtituloDto) {}
