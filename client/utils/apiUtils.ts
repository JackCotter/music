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

export const createTrack = async (projectId: number, trackName: string, instrumentType:string, blobData:Blob) => {
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
        console.error("Unsupported result type");
        return;
    }
    console.log(base64Data);
    const response = await api.post("/tracks/create" , { projectId, trackName, instrumentType, blobData: base64Data }, {withCredentials: true});
    return response.data;
  }

  reader.readAsDataURL(blobData);
}

export const getProject = async (projectId: number) => {
  const response = await api.get(`/projects/get?projectId=${projectId}`, {withCredentials: false});
  return response.data as Project;
}

export const createProject = async (projectName: string, instrumentTypes: string[], strictMode: boolean): Promise<{projectId: string}> => {
  const response = await api.post("/projects/create", { projectName, instrumentTypes, strictMode }, {withCredentials: true});
  return response.data;
}