import { apiRequest } from './apiClient';

export function runDataLoader() {
  return apiRequest<Record<string, unknown>>('/api/data-loader/run', {
    method: 'POST',
  });
}
