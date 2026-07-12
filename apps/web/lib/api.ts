import { ApiError } from './errors';

type ApiErrorBody = {
  message?: string | string[];
};

type ApiPath = `/${string}`;

type ApiClientOptions = {
  baseUrl?: string;
  token?: string;
  fetchImpl?: typeof fetch;
};

const DEFAULT_API_URL = (
  process.env.API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export class ApiClient {
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly fetchImpl?: typeof fetch;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_API_URL;
    this.token = options.token;
    this.fetchImpl = options.fetchImpl;
  }

  get<TResponse>(path: ApiPath, init?: Omit<RequestInit, 'body' | 'method'>) {
    return this.request<TResponse>(path, {
      ...init,
      method: 'GET',
    });
  }

  post<TResponse, TBody = unknown>(
    path: ApiPath,
    body?: TBody,
    init?: Omit<RequestInit, 'body' | 'method'>,
  ) {
    return this.request<TResponse>(path, {
      ...init,
      body: body === undefined ? undefined : JSON.stringify(body),
      method: 'POST',
    });
  }

  delete<TResponse = undefined>(
    path: ApiPath,
    init?: Omit<RequestInit, 'body' | 'method'>,
  ) {
    return this.request<TResponse>(path, {
      ...init,
      method: 'DELETE',
    });
  }

  private async request<TResponse>(
    path: ApiPath,
    init: RequestInit,
  ): Promise<TResponse> {
    const headers = new Headers(init.headers);

    if (init.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    let response: Response;

    try {
      const fetch = this.fetchImpl ?? globalThis.fetch;

      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        cache: 'no-store',
        headers,
      });
    } catch {
      throw new ApiError(503, 'The API is unavailable. Please try again.');
    }

    let body: unknown;

    if (response.status !== 204) {
      const responseText = await response.text();

      if (responseText) {
        try {
          body = JSON.parse(responseText) as unknown;
        } catch {
          body = { message: responseText };
        }
      }
    }

    if (!response.ok) {
      const errorBody = body as ApiErrorBody | undefined;
      const message = Array.isArray(errorBody?.message)
        ? errorBody.message.join(', ')
        : errorBody?.message;

      throw new ApiError(
        response.status,
        message || `API request failed (${response.status})`,
      );
    }

    return body as TResponse;
  }
}
