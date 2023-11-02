interface Track {
  blobData: string;
  instrumentType: string;
  accepted: boolean;
}

interface Project {
  projectid: number;
  lookingfor?: string[];
  lookingforstrict: boolean;
  accepted: boolean;
  projectname: string;
  username: string;
}