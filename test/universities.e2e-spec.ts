import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UniversitiesService } from '../src/universities/universities.service';

type MockedUniversitiesService = {
  [K in keyof UniversitiesService]: jest.Mock;
};

describe('universitiesController (e2e)', () => {
  let app: INestApplication;
  let universitiesService: MockedUniversitiesService;

  const mockUniversities = [
    {
      name: 'Harvard universities',
      country: 'United States',
      alpha_two_code: 'US',
      domains: ['harvard.edu'],
      web_pages: ['http://www.harvard.edu'],
    },
  ];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(universitiesService)
      .useValue({
        findAll: jest.fn().mockResolvedValue(mockUniversities),
        searchByName: jest.fn().mockResolvedValue(mockUniversities),
        searchByCountry: jest.fn().mockResolvedValue(mockUniversities),
        searchByDomain: jest.fn().mockResolvedValue(mockUniversities),
        search: jest.fn().mockResolvedValue(mockUniversities),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    universitiesService = moduleFixture.get<UniversitiesService>(UniversitiesService) as unknown as MockedUniversitiesService;
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/universities (GET)', () => {
    it('deve retornar lista de universidades', () => {
      return request(app.getHttpServer())
        .get('/universities')
        .expect(200)
        .expect(mockUniversities);
    });

    it('deve chamar o serviço findAll', async () => {
      await request(app.getHttpServer()).get('/universities');
      expect(universitiesService.findAll).toHaveBeenCalled();
    });
  });

  describe('/universities/search (GET)', () => {
    it('deve retornar universidades filtradas com múltiplos parâmetros', () => {
      return request(app.getHttpServer())
        .get('/universities/search?name=Harvard&country=United States')
        .expect(200)
        .expect(mockUniversities);
    });

    it('deve chamar o serviço search com os parâmetros corretos', async () => {
      await request(app.getHttpServer()).get('/universities/search?name=Harvard&country=United States');
      expect(universitiesService.search).toHaveBeenCalledWith({ name: 'Harvard', country: 'United States' });
    });
  })

  describe('/universities com paginação baseada em offset (GET)', () => {
    const mockPaginatedResponse = {
      items: [
        {
          name: 'Harvard universities',
          country: 'United States',
          alpha_two_code: 'US',
          domains: ['harvard.edu'],
          web_pages: ['http://www.harvard.edu'],
        },
      ],
      meta: {
        offset: 0,
        limit: 10,
        totalItems: 100,
        hasMore: true,
      },
    };

    beforeEach(() => {
      universitiesService.findAll.mockResolvedValue(mockPaginatedResponse);
      universitiesService.search.mockResolvedValue(mockPaginatedResponse);
      universitiesService.searchByName.mockResolvedValue(mockPaginatedResponse);
      universitiesService.searchByCountry.mockResolvedValue(mockPaginatedResponse);
      universitiesService.searchByDomain.mockResolvedValue(mockPaginatedResponse);
    });

    it('deve retornar resposta paginada', () => {
      return request(app.getHttpServer())
        .get('/universities')
        .expect(200)
        .expect(mockPaginatedResponse);
    });

    it('deve passar os parâmetros de offset e limit corretamente', async () => {
      await request(app.getHttpServer())
        .get('/universities?offset=20&limit=15');

      expect(universitiesService.findAll).toHaveBeenCalledWith(20, 15);
    });

    it('deve usar valores padrão quando parâmetros de paginação não são fornecidos', async () => {
      await request(app.getHttpServer())
        .get('/universities');

      expect(universitiesService.findAll).toHaveBeenCalledWith(0, 10);
    });

    it('deve rejeitar valores negativos para offset', async () => {
      const response = await request(app.getHttpServer())
        .get('/universities?offset=-10');

      expect(response.status).toBe(400);
    });

    it('deve rejeitar valores negativos ou zero para limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/universities?limit=0');

      expect(response.status).toBe(400);
    });
  });

  describe('/universities/search com paginação (GET)', () => {
    it('deve aplicar offset/limit e parâmetros de busca', async () => {
      await request(app.getHttpServer())
        .get('/universities/search?name=Harvard&country=US&offset=30&limit=15');

      expect(universitiesService.search).toHaveBeenCalledWith({
        name: 'Harvard',
        country: 'US',
        offset: 30,
        limit: 15
      });
    });
  });

  describe('/universities/search/name com paginação (GET)', () => {
    it('deve aplicar offset/limit na busca por nome', async () => {
      await request(app.getHttpServer())
        .get('/universities/search/name?name=Harvard&offset=25&limit=5');

      expect(universitiesService.searchByName).toHaveBeenCalledWith('Harvard', 25, 5);
    });
  });

  describe('/universities/search/country com paginação (GET)', () => {
    it('deve aplicar offset/limit na busca por país', async () => {
      await request(app.getHttpServer())
        .get('/universities/search/country?country=Brazil&offset=50&limit=25');

      expect(universitiesService.searchByCountry).toHaveBeenCalledWith('Brazil', 50, 25);
    });
  });

  describe('/universities/search/domain com paginação (GET)', () => {
    it('deve aplicar offset/limit na busca por domínio', async () => {
      await request(app.getHttpServer())
        .get('/universities/search/domain?domain=edu.br&offset=10&limit=20');

      expect(universitiesService.searchByDomain).toHaveBeenCalledWith('edu.br', 10, 20);
    });
  });
});
