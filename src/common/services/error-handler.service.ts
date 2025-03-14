import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ApiClient } from '../../common/services/api-client.service';

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  constructor(private readonly apiClient: ApiClient) { }

  handleApiError(error: any): never {
    if (this.apiClient.isAxiosError(error)) {
      const axiosError = error;

      this.logger.error(`Erro na API externa: ${axiosError.code || 'unknown'} - ${axiosError.message}`, {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        status: axiosError.response?.status,
      });

      if (
        axiosError.code === 'ECONNABORTED' ||
        axiosError.code === 'ERR_BAD_RESPONSE' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new HttpException(
          'O servidor está temporariamente indisponível. Por favor, tente novamente mais tarde.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      if (axiosError.response?.status && axiosError.response.status >= 500) {
        throw new HttpException(
          'O servidor retornou um erro. Por favor, tente novamente mais tarde.',
          HttpStatus.BAD_GATEWAY
        );
      }

      if (axiosError.response) {
        throw new HttpException(
          this.apiClient.getErrorMessage(axiosError),
          axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    this.logger.error('Erro não identificado ao acessar API externa', error);
    throw new HttpException(
      'Falha ao obter dados. Por favor, tente novamente mais tarde.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
