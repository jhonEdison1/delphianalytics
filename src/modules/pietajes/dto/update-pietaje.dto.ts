import { PartialType } from '@nestjs/swagger';
import { CreatePietajeDto } from './create-pietaje.dto';

export class UpdatePietajeDto extends PartialType(CreatePietajeDto) {}
