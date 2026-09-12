import axiosClient from './axiosClient';

export const getRecommendations = (prompt) =>
  axiosClient.post('/recommendations', { prompt }).then((r) => r.data);
