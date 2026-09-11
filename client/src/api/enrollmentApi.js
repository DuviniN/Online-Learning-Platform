import axiosClient from './axiosClient';

export const enrollInCourse = (courseId) =>
  axiosClient.post('/enrollments', { courseId }).then((r) => r.data);
export const getMyEnrollments = () => axiosClient.get('/enrollments/mine').then((r) => r.data);
