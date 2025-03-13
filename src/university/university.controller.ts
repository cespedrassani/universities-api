import { Controller, Get, Query } from '@nestjs/common';
import { UniversityService } from './university.service';
import { UniversityDto, SearchQueryDto } from './dto/university.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('universities')
@Controller('universities')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todas as universidades' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas as universidades',
    type: UniversityDto,
    isArray: true,
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async findAll(): Promise<UniversityDto[]> {
    return this.universityService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar universidades com múltiplos critérios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de universidades que correspondem aos critérios',
    type: UniversityDto,
    isArray: true,
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async search(@Query() query: SearchQueryDto): Promise<UniversityDto[]> {
    return this.universityService.search(query);
  }

  @Get('search/name')
  @ApiOperation({ summary: 'Buscar universidades por nome' })
  @ApiQuery({ name: 'name', required: true, description: 'Nome ou parte do nome da universidade' })
  @ApiResponse({
    status: 200,
    description: 'Lista de universidades que correspondem ao nome buscado',
    type: UniversityDto,
    isArray: true,
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async searchByName(@Query('name') name: string): Promise<UniversityDto[]> {
    return this.universityService.searchByName(name);
  }

  @Get('search/country')
  @ApiOperation({ summary: 'Buscar universidades por país' })
  @ApiQuery({ name: 'country', required: true, description: 'Nome do país em inglês (ex: Brazil, United States)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de universidades no país especificado',
    type: UniversityDto,
    isArray: true,
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async searchByCountry(@Query('country') country: string): Promise<UniversityDto[]> {
    return this.universityService.searchByCountry(country);
  }

  @Get('search/domain')
  @ApiOperation({ summary: 'Buscar universidades por domínio' })
  @ApiQuery({ name: 'domain', required: true, description: 'Domínio ou parte do domínio da universidade (ex: edu.br, harvard.edu)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de universidades com o domínio especificado',
    type: UniversityDto,
    isArray: true,
  })
  @ApiResponse({ status: 500, description: 'Erro no servidor ao buscar dados da API externa' })
  async searchByDomain(@Query('domain') domain: string): Promise<UniversityDto[]> {
    return this.universityService.searchByDomain(domain);
  }
}
