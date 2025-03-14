import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { UniversitiesService } from './universities.service';

describe('universitiesController (e2e)', () => {
  let app: INestApplication;
  let universitiesService: UniversitiesService;

  const mockUniversities = {
    items: [
      {
        name: 'Harvard University',
        country: 'United States',
        alpha_two_code: 'US',
        domains: ['harvard.edu'],
        web_pages: ['http://www.harvard.edu'],
        'state-province': null,
      },
    ],
    meta: {
      offset: 0,
      limit: 10,
      totalItems: 1,
      hasMore: false,
    },
  };

  beforeEach(async () => {
    const mockUniversitiesService = {
      findAll: jest.fn().mockResolvedValue(mockUniversities),
      searchByName: jest.fn().mockResolvedValue(mockUniversities),
      searchByCountry: jest.fn().mockResolvedValue(mockUniversities),
      searchByDomain: jest.fn().mockResolvedValue(mockUniversities),
      search: jest.fn().mockResolvedValue(mockUniversities),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UniversitiesService)
      .useValue(mockUniversitiesService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    universitiesService = moduleFixture.get<UniversitiesService>(UniversitiesService);

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
  });
});
