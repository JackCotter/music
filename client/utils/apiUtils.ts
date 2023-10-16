import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export const login = async (username: string, password: string) => {
  const response = await api.post("/login", { username, password });
  return response.data;
};

export const getTrackList = async (projectId: number) => {
  const response = await api.get(`/tracks/list?projectId=${projectId}`);
  return response.data;
}

export const createTrack = async (projectId: number, trackName: string) => {
  const response = await api.post(`/tracks/create?projectId=${projectId}&trackName=${trackName}`);
  return response.data;
}