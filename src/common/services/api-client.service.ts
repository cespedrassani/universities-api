import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class ApiClient {
  private readonly apiBaseUrl = 'http://universities.hipolabs.com';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  private readonly logger = new Logger(ApiClient.name);

  async callApi<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let lastError: any;
    const url = `${this.apiBaseUrl}${endpoint}`;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Tentativa ${attempt} de ${this.maxRetries} para ${url}`);

        const config = {
          timeout: 5000,
          params,
          headers: {
            'Accept-Encoding': 'gzip, deflate',
            'User-Agent': 'universities-API-Client/1.0',
          },
        };

        const response = await axios.get<T>(url, config);
        return response.data;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Tentativa ${attempt} falhou: ${this.getErrorMessage(error)}`);

        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    throw lastError;
  }

  getErrorMessage(error: any): string {
    if (!axios.isAxiosError(error)) {
      return String(error.message || 'Erro desconhecido');
    }

    const axiosError = error as AxiosError;

    if (!axiosError.response?.data) {
      return axiosError.message;
    }

    const { data } = axiosError.response;

    if (typeof data === 'string') {
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }

      try {
        return JSON.stringify(data);
      } catch {
        // ignorado
      }
    }

    return 'Falha ao obter dados da API externa';
  }

  isAxiosError(error: any): error is AxiosError {
    return axios.isAxiosError(error);
  }
}
