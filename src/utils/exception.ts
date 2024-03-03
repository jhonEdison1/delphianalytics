import { HttpStatus, HttpException } from '@nestjs/common';

export class MiExcepcionPersonalizada extends HttpException {
  constructor(mensaje: string, statusCode: number) {
    super({ mensaje, statusCode }, statusCode);
  }
}
