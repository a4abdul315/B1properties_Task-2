import apiClient from './apiClient';

const extractData = (response) => response.data.data;

export async function fetchCompetitors() {
  const response = await apiClient.get('/competitors');
  return extractData(response);
}

export async function fetchPriceTracker(params) {
  const response = await apiClient.get('/insights/price-tracker', { params });
  return extractData(response);
}

export async function fetchListingVelocity(params) {
  const response = await apiClient.get('/insights/listing-velocity', { params });
  return extractData(response);
}

export async function fetchMarketHeat(params) {
  const response = await apiClient.get('/insights/market-heat', { params });
  return extractData(response);
}

export async function fetchAlerts() {
  const response = await apiClient.get('/alerts');
  return extractData(response);
}
