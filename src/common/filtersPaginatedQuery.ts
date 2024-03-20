import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class FiltersPaginatedQuery {
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    page: number;
  
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    limit: number;

    @IsString()
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    orden?: 'ASC' | 'DESC';

    @IsString()
    @IsOptional()
    @IsIn(['alfabetico', 'fecha'])
    criterioOrden?: 'alfabetico' | 'fecha';
  }