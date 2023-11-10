interface Track {
  blobData: string;
  title: string;
  description: string;
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
  description: string;
}