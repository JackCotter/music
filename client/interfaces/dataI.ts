interface Track {
  blobData: string;
  instrumentType: string;
  accepted: boolean;
}

interface Project {
  projectid: number;
  lookingfor: string | null;
  lookingforstrict: boolean | null;
  accepted: boolean;
  projectname: string;
  username: string;
}