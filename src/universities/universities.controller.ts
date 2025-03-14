import { Controller, Get, Query } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { UniversitiesDto, SearchQueryDto } from './dto/universities.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todas as universidades (com paginação)' })
  @ApiOkResponse({
    description: 'Lista paginada de universidades',
    type: PaginatedResponseDto
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<UniversitiesDto>> {
    const { offset = 0, limit = 10 } = paginationDto;
    return this.universitiesService.findAll(offset, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar universidades com múltiplos critérios (com paginação)' })
  @ApiOkResponse({
    description: 'Lista paginada de universidades que correspondem aos critérios',
    type: PaginatedResponseDto
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async search(@Query() query: SearchQueryDto): Promise<PaginatedResponseDto<UniversitiesDto>> {
    return this.universitiesService.search(query);
  }

  @Get('search/name')
  @ApiOperation({ summary: 'Buscar universidades por nome (com paginação)' })
  @ApiQuery({ name: 'name', required: true, description: 'Nome ou parte do nome da universidade' })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de registros a pular', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de itens por página', type: Number })
  @ApiOkResponse({
    description: 'Lista paginada de universidades que correspondem ao nome buscado',
    type: PaginatedResponseDto
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async searchByName(
    @Query('name') name: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number
  ): Promise<PaginatedResponseDto<UniversitiesDto>> {
    return this.universitiesService.searchByName(name, offset, limit);
  }

  @Get('search/country')
  @ApiOperation({ summary: 'Buscar universidades por país (com paginação)' })
  @ApiQuery({ name: 'country', required: true, description: 'Nome do país em inglês (ex: Brazil, United States)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de registros a pular', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de itens por página', type: Number })
  @ApiOkResponse({
    description: 'Lista paginada de universidades no país especificado',
    type: PaginatedResponseDto
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async searchByCountry(
    @Query('country') country: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number
  ): Promise<PaginatedResponseDto<UniversitiesDto>> {
    return this.universitiesService.searchByCountry(country, offset, limit);
  }

  @Get('search/domain')
  @ApiOperation({ summary: 'Buscar universidades por domínio (com paginação)' })
  @ApiQuery({ name: 'domain', required: true, description: 'Domínio ou parte do domínio da universidade (ex: edu.br, harvard.edu)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de registros a pular', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de itens por página', type: Number })
  @ApiOkResponse({
    description: 'Lista paginada de universidades com o domínio especificado',
    type: PaginatedResponseDto
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async searchByDomain(
    @Query('domain') domain: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number
  ): Promise<PaginatedResponseDto<UniversitiesDto>> {
    return this.universitiesService.searchByDomain(domain, offset, limit);
  }
}
