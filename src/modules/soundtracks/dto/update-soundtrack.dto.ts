import { PartialType } from '@nestjs/swagger';
import { CreateSoundtrackDto } from './create-soundtrack.dto';

export class UpdateSoundtrackDto extends PartialType(CreateSoundtrackDto) {}
