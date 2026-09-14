import axiosClient from './axiosClient';

export const getAllCourses = (params) => axiosClient.get('/courses', { params }).then((r) => r.data);
export const getMyCourses = () => axiosClient.get('/courses/mine').then((r) => r.data);
export const getCourseById = (id) => axiosClient.get(`/courses/${id}`).then((r) => r.data);
export const createCourse = (data) => axiosClient.post('/courses', data).then((r) => r.data);
export const updateCourse = (id, data) => axiosClient.put(`/courses/${id}`, data).then((r) => r.data);
export const deleteCourse = (id) => axiosClient.delete(`/courses/${id}`).then((r) => r.data);
export const getEnrolledStudents = (id) => axiosClient.get(`/courses/${id}/students`).then((r) => r.data);
