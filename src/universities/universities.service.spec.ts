import { Test, TestingModule } from '@nestjs/testing';
import { UniversitiesService } from './universities.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';
import { HttpException } from '@nestjs/common';

jest.mock('axios');

type MockedAxios = {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  patch: jest.Mock;
};

const mockedAxios = axios as unknown as MockedAxios;

describe('UniversitiesService', () => {
  let service: UniversitiesService;
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversitiesService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<UniversitiesService>(UniversitiesService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const mockUniversities = [
      {
        name: 'universities 1',
        country: 'Country 1',
        alpha_two_code: 'C1',
        domains: ['domain1.edu'],
        web_pages: ['http://domain1.edu'],
      },
    ];

    it('deve retornar dados do cache se disponíveis', async () => {
      cacheManager.get.mockResolvedValue(mockUniversities);

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('all_universities');
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockUniversities);
    });

    it('deve buscar dados da API e armazenar no cache se não houver cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({ data: mockUniversities });

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('all_universities');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://universities.hipolabs.com/search');
      expect(cacheManager.set).toHaveBeenCalledWith('all_universities', mockUniversities, 3600);
      expect(result).toEqual(mockUniversities);
    });

    it('deve lançar HttpException se a API retornar erro', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('searchByName', () => {
    const mockName = 'Harvard';
    const mockUniversities = [
      {
        name: 'Harvard universities',
        country: 'United States',
        alpha_two_code: 'US',
        domains: ['harvard.edu'],
        web_pages: ['http://www.harvard.edu'],
      },
    ];

    it('deve retornar dados do cache se disponíveis', async () => {
      cacheManager.get.mockResolvedValue(mockUniversities);

      const result = await service.searchByName(mockName);

      expect(cacheManager.get).toHaveBeenCalledWith(`name_${mockName}`);
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockUniversities);
    });

    it('deve buscar dados da API e armazenar no cache se não houver cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({ data: mockUniversities });

      const result = await service.searchByName(mockName);

      expect(cacheManager.get).toHaveBeenCalledWith(`name_${mockName}`);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://universities.hipolabs.com/search', {
        params: { name: mockName },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(`name_${mockName}`, mockUniversities, 3600);
      expect(result).toEqual(mockUniversities);
    });

    it('deve lançar HttpException se a API retornar erro', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.searchByName(mockName)).rejects.toThrow(HttpException);
    });
  });

  describe('Paginação ', () => {
    const mockUniversities = Array(30).fill(0).map((_, index) => ({
      name: `universities ${index + 1}`,
      country: `Country ${Math.floor(index / 10) + 1}`,
      alpha_two_code: 'C1',
      domains: [`domain${index + 1}.edu`],
      web_pages: [`http://domain${index + 1}.edu`],
    }));

    describe('findAll com paginação', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('deve chamar a API externa com os parâmetros de offset e limit corretos', async () => {
        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: mockUniversities.slice(10, 20) })
        );

        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: mockUniversities.slice(0, 1) })
        );

        await service.findAll(10, 10);

        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          1,
          'http://universities.hipolabs.com/search',
          expect.objectContaining({
            params: { offset: 10, limit: 10 }
          })
        );

        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          2,
          'http://universities.hipolabs.com/search',
          expect.objectContaining({
            params: { offset: 20, limit: 1 }
          })
        );
      });

      it('deve retornar dados paginados do cache quando disponíveis', async () => {
        const mockPaginatedResponse = {
          items: mockUniversities.slice(5, 15),
          meta: {
            offset: 5,
            limit: 10,
            totalItems: 30,
            hasMore: true
          }
        };

        cacheManager.get.mockResolvedValue(mockPaginatedResponse);

        const result = await service.findAll(5, 10);

        expect(cacheManager.get).toHaveBeenCalledWith('all_universities_offset5_limit10');
        expect(mockedAxios.get).not.toHaveBeenCalled();
        expect(result).toEqual(mockPaginatedResponse);
      });

      it('deve calcular corretamente hasMore quando há mais itens', async () => {
        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: mockUniversities.slice(0, 10) })
        );

        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: [mockUniversities[10]] })
        );

        const result = await service.findAll(0, 10);

        expect(result.meta.hasMore).toBe(true);
        expect(result.meta.totalItems).toBeGreaterThan(10);
      });

      it('deve calcular corretamente hasMore quando não há mais itens', async () => {
        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: mockUniversities.slice(20, 30) })
        );

        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: [] })
        );

        const result = await service.findAll(20, 10);

        expect(result.meta.hasMore).toBe(false);
      });
    });

    describe('searchByName com paginação', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('deve passar os parâmetros de paginação e busca corretamente', async () => {
        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: mockUniversities.slice(0, 5) })
        );

        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: [] })
        );

        await service.searchByName('Technology', 0, 5);

        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          1,
          'http://universities.hipolabs.com/search',
          expect.objectContaining({
            params: { name: 'Technology', offset: 0, limit: 5 }
          })
        );
      });
    });

    describe('searchByCountry com paginação', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('deve passar os parâmetros de paginação e busca corretamente', async () => {
        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: mockUniversities.slice(0, 5) })
        );

        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: [] })
        );

        await service.searchByCountry('Brazil', 0, 5);

        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          1,
          'http://universities.hipolabs.com/search',
          expect.objectContaining({
            params: { country: 'Brazil', offset: 0, limit: 5 }
          })
        );
      });
    });

    describe('search com paginação e múltiplos critérios', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('deve passar todos os parâmetros de busca e paginação corretamente', async () => {
        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: mockUniversities.slice(0, 3) })
        );

        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: [] })
        );

        const queryParams = {
          name: 'universities',
          country: 'Brazil',
          offset: 5,
          limit: 3
        };

        await service.search(queryParams);

        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          1,
          'http://universities.hipolabs.com/search',
          expect.objectContaining({
            params: queryParams
          })
        );
      });

      it('deve usar valores padrão quando offset e limit não são fornecidos', async () => {
        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: mockUniversities.slice(0, 10) })
        );

        mockedAxios.get.mockImplementationOnce(() =>
          Promise.resolve({ data: [] })
        );

        const queryParams = {
          name: 'universities'
        };

        await service.search(queryParams);

        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          1,
          'http://universities.hipolabs.com/search',
          expect.objectContaining({
            params: { name: 'universities', offset: 0, limit: 10 }
          })
        );
      });
    });
  });
});
