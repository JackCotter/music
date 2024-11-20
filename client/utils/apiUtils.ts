import axios from "axios";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

export const login = async (email: string, password: string) => {
  const response = await api.post("/users/login", { email, password }, {withCredentials: true});
  return response.data as string;
};

export const getTrackList = async (projectId: number) => {
  const response = await api.get(`/tracks/list?projectId=${projectId}`, {withCredentials: false});
  return response.data;
}

export const patchTrack = async (trackIds: number[], projectId:number, accepted: boolean) => {
  const response = await api.patch(`/tracks/patch`, {trackIds, projectId, accepted} );
  return response.data;
}

export const createTrack = async (projectId: number, title: string, description:string, instrumentType:string, blobData:Blob, accepted?: boolean) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      let base64Data: string;

      if (typeof reader.result === 'string') {
          // If the result is a string, it's already in the expected format
          base64Data = reader.result.split(',')[1];
      } else if (reader.result instanceof ArrayBuffer) {
          // If the result is an ArrayBuffer, convert it to a base64 string
          const binaryArray = new Uint8Array(reader.result);
          const binaryStringChars = Array.from(binaryArray).map((charCode) => String.fromCharCode(charCode));
          const binaryString = binaryStringChars.join('');
          base64Data = btoa(binaryString);
      } else {
          // Handle unsupported result types here
          reject(new Error("Unsupported result type"));
          return;
      }
      try {
        const response = await api.post("/tracks/create" , { projectId, title, description, instrumentType, blobData: base64Data, accepted }, {withCredentials: true});
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    }
  reader.onerror = (error) => {
    reject(error);
  }
  reader.readAsDataURL(blobData);
  });
}

export const getProject = async (projectId: number) => {
  const response = await api.get(`/projects/get?projectId=${projectId}`, {withCredentials: true});
  return response.data as Project;
}

export const listProject = async (page?:number, username?:string) => {
  page ?? 1
  if (username === undefined) {
    const response = await api.get(`/projects/list?page=${page}`, {withCredentials: false});
    return response.data as Project[];
  } else {
    const response = await api.get(`/projects/list?page=${page}&username=${username}`, {withCredentials: false});
    return response.data as Project[];
  }
}

export const pagecountProject = async (username?:string) => {
  if (username === undefined){
    const response = await api.get("/projects/pagecount", {withCredentials: false});
    return response.data as number;
  } else {
    const response = await api.get(`/projects/pagecount?username=${username}`, {withCredentials: false});
    return response.data as number;
  }
}

export const createProject = async (projectName: string, instrumentTypes: string[], strictMode: boolean, description:string): Promise<{projectId: string}> => {
  const response = await api.post("/projects/create", { projectName, instrumentTypes, strictMode, description }, {withCredentials: true});
  return response.data;
}

export const getUserLoggedIn = async () => {
  const response = await api.get("/users/loggedIn", {withCredentials: true});
  return response.data as string;
}

export const listProjectTracks = async (username: string) => {
  const response = await api.get(`/projecttracks/list?username=${username}`, {withCredentials: false});
  return response.data as UserContribution[];
}

export const getUser = async (username: string) => {
  const response = await api.get(`/users/get?username=${username}`, {withCredentials: false});
  return response.data as User;
}

export const patchUser = async (description: string) => {
  const response = await api.patch(`/users/patch`, {description}, {withCredentials: true});
  return response.data as User;
}

export const createUser = async (username: string, email: string, password: string, recaptchaToken: string, description?: string) => {
  const response = await api.post("/users/create", { username, email, password, recaptchaToken, description }, {withCredentials: false});
  return response.data as string;
}