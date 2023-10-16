import axios from "axios";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

export const login = async (email: string, password: string) => {
  const response = await api.post("/users/login", { email, password }, {withCredentials: true});
  return response.data;
};

export const getTrackList = async (projectId: number) => {
  const response = await api.get(`/tracks/list?projectId=${projectId}`, {withCredentials: false});
  return response.data;
}

export const createTrack = async (projectId: number, trackName: string, instrumentType:string, url:string) => {
  const response = await api.post("/tracks/create" , { projectId, trackName, instrumentType, url }, {withCredentials: true});
  return response.data;
}