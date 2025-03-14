import { Test, TestingModule } from '@nestjs/testing';
import { UniversitiesService } from './universities.service';
import { ApiClient } from '../common/services/api-client.service';
import { CacheService } from '../common/services/cache.service';
import { ErrorHandlerService } from '../common/services/error-handler.service';
import { PaginationUtils } from '../common/utils/pagination.utils';
import { PaginatedResponseDto } from '../common/dto/pagination-response.dto';
import { UniversitiesDto, SearchQueryDto } from './dto/universities.dto';

describe('UniversitiesService', () => {
  let service: UniversitiesService;
  let apiClientMock: jest.Mocked<ApiClient>;
  let cacheServiceMock: jest.Mocked<CacheService>;
  let errorHandlerMock: jest.Mocked<ErrorHandlerService>;

  const mockUniversities: UniversitiesDto[] = [
    {
      name: 'Universidade de São Paulo',
      country: 'Brazil',
      domains: ['usp.br'],
      web_pages: ['https://www.usp.br'],
      alpha_two_code: 'BR'
    },
    {
      name: 'Universidade Federal do Rio de Janeiro',
      country: 'Brazil',
      domains: ['ufrj.br'],
      web_pages: ['https://www.ufrj.br'],
      alpha_two_code: 'BR'
    }
  ];

  const mockPaginatedResponse: PaginatedResponseDto<UniversitiesDto> = {
    items: mockUniversities,
    meta: {
      offset: 0,
      limit: 10,
      hasMore: true,
      totalItems: 11
    }
  };

  beforeEach(async () => {
    apiClientMock = {
      callApi: jest.fn(),
    } as any;

    cacheServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
      getAllKey: jest.fn(),
      getByNameKey: jest.fn(),
      getByCountryKey: jest.fn(),
      getByDomainKey: jest.fn(),
      getSearchKey: jest.fn(),
    } as any;

    errorHandlerMock = {
      handleApiError: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversitiesService,
        { provide: ApiClient, useValue: apiClientMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: ErrorHandlerService, useValue: errorHandlerMock },
      ],
    }).compile();

    service = module.get<UniversitiesService>(UniversitiesService);

    jest.spyOn(PaginationUtils, 'getHasMoreParams').mockReturnValue({ offset: 10, limit: 10 });
    jest.spyOn(PaginationUtils, 'calculateTotalItems').mockReturnValue(2);
    jest.spyOn(PaginationUtils, 'createPaginatedResponse').mockReturnValue(mockPaginatedResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return cached data when available', async () => {
      const cacheKey = 'all:0:10';
      cacheServiceMock.getAllKey.mockReturnValue(cacheKey);
      cacheServiceMock.get.mockResolvedValue(mockPaginatedResponse);

      const result = await service.findAll();

      expect(cacheServiceMock.getAllKey).toHaveBeenCalledWith(0, 10);
      expect(cacheServiceMock.get).toHaveBeenCalledWith(cacheKey);
      expect(apiClientMock.callApi).not.toHaveBeenCalled();
      expect(cacheServiceMock.set).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch data from API and cache it when cache is empty', async () => {
      const cacheKey = 'all:0:10';
      cacheServiceMock.getAllKey.mockReturnValue(cacheKey);
      cacheServiceMock.get.mockResolvedValue(null);
      apiClientMock.callApi.mockResolvedValueOnce(mockUniversities);
      apiClientMock.callApi.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(cacheServiceMock.get).toHaveBeenCalledWith(cacheKey);
      expect(apiClientMock.callApi).toHaveBeenCalledWith('/search', { offset: 0, limit: 10 });
      expect(apiClientMock.callApi).toHaveBeenCalledWith('/search', { offset: 10, limit: 10 });
      expect(PaginationUtils.calculateTotalItems).toHaveBeenCalled();
      expect(PaginationUtils.createPaginatedResponse).toHaveBeenCalledWith(mockUniversities, 2, 0, 10);
      expect(cacheServiceMock.set).toHaveBeenCalledWith(cacheKey, mockPaginatedResponse);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle errors properly', async () => {
      const error = new Error('API Error');
      cacheServiceMock.getAllKey.mockReturnValue('all:0:10');
      cacheServiceMock.get.mockResolvedValue(null);
      apiClientMock.callApi.mockRejectedValue(error);

      const result = await service.findAll();

      expect(errorHandlerMock.handleApiError).toHaveBeenCalledWith(error);
      expect(result).toEqual(undefined);
    });
  });

  describe('searchByName', () => {
    it('should return cached data when available', async () => {
      const cacheKey = 'name:USP:0:10';
      cacheServiceMock.getByNameKey.mockReturnValue(cacheKey);
      cacheServiceMock.get.mockResolvedValue(mockPaginatedResponse);

      const result = await service.searchByName('USP');

      expect(cacheServiceMock.getByNameKey).toHaveBeenCalledWith('USP', 0, 10);
      expect(cacheServiceMock.get).toHaveBeenCalledWith(cacheKey);
      expect(apiClientMock.callApi).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch data from API and cache it when cache is empty', async () => {
      const cacheKey = 'name:USP:0:10';
      cacheServiceMock.getByNameKey.mockReturnValue(cacheKey);
      cacheServiceMock.get.mockResolvedValue(null);
      apiClientMock.callApi.mockResolvedValueOnce(mockUniversities);
      apiClientMock.callApi.mockResolvedValueOnce([]);

      const result = await service.searchByName('USP');

      expect(cacheServiceMock.get).toHaveBeenCalledWith(cacheKey);
      expect(apiClientMock.callApi).toHaveBeenCalledWith('/search', { name: 'USP', offset: 0, limit: 10 });
      expect(cacheServiceMock.set).toHaveBeenCalledWith(cacheKey, mockPaginatedResponse);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('searchByCountry', () => {
    it('should fetch data from API when cache is empty', async () => {
      const cacheKey = 'country:Brazil:0:10';
      cacheServiceMock.getByCountryKey.mockReturnValue(cacheKey);
      cacheServiceMock.get.mockResolvedValue(null);
      apiClientMock.callApi.mockResolvedValueOnce(mockUniversities);
      apiClientMock.callApi.mockResolvedValueOnce([]);

      const result = await service.searchByCountry('Brazil');

      expect(apiClientMock.callApi).toHaveBeenCalledWith('/search', { country: 'Brazil', offset: 0, limit: 10 });
      expect(cacheServiceMock.set).toHaveBeenCalledWith(cacheKey, mockPaginatedResponse);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('search', () => {
    it('should use all search parameters provided', async () => {
      const query: SearchQueryDto = {
        name: 'USP',
        country: 'Brazil',
        domain: 'usp.br',
        offset: 5,
        limit: 20
      };

      const cacheKey = 'search:params:5:20';
      cacheServiceMock.getSearchKey.mockReturnValue(cacheKey);
      cacheServiceMock.get.mockResolvedValue(null);
      apiClientMock.callApi.mockResolvedValueOnce(mockUniversities);
      apiClientMock.callApi.mockResolvedValueOnce([]);

      const result = await service.search(query);

      expect(cacheServiceMock.getSearchKey).toHaveBeenCalledWith(
        { name: 'USP', country: 'Brazil', domain: 'usp.br' },
        5,
        20
      );
      expect(apiClientMock.callApi).toHaveBeenCalledWith('/search', {
        name: 'USP',
        country: 'Brazil',
        domain: 'usp.br',
        offset: 5,
        limit: 20
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });
});
