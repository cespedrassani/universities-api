import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class UniversitiesDto {
  @ApiProperty({ description: 'Nome da universidade' })
  name: string;

  @ApiProperty({ description: 'País onde a universidade está localizada' })
  country: string;

  @ApiProperty({ description: 'Código ISO de dois caracteres do país' })
  alpha_two_code: string;

  @ApiPropertyOptional({ description: 'Estado ou província onde a universidade está localizada' })
  state_province?: string;

  @ApiProperty({ description: 'Domínios associados à universidade', type: [String] })
  domains: string[];

  @ApiProperty({ description: 'Páginas web da universidade', type: [String] })
  web_pages: string[];
}

export class SearchQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Nome ou parte do nome da universidade' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'País da universidade (em inglês)' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Domínio ou parte do domínio da universidade' })
  @IsOptional()
  @IsString()
  domain?: string;
}
