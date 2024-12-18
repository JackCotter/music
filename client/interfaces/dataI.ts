interface Track {
  trackId: number;
  blobData: string;
  offset: number;
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
  isowner: boolean;
}

interface UserContribution {
  title: string;
  trackid: number;
  createdat: Date;
}

interface User {
  username: string;
  description: string;
}
