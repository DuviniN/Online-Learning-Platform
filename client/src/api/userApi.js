import axiosClient from './axiosClient';

export const getMe = () => axiosClient.get('/auth/me').then((r) => r.data);
export const updateMe = (data) => axiosClient.put('/auth/me', data).then((r) => r.data);
