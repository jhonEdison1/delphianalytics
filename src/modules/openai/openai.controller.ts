import { Body, Controller, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
    constructor(private readonly openaiService: OpenaiService) {}

    @Post('traducir')
    async traducirTexto(
      @Body('texto') texto: string,
      @Body('idioma') idioma: string
    ) {
        return await this.openaiService.traducirTexto(texto, idioma);
    }
}
