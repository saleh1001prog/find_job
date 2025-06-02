export interface JobPosition {
  title: string;
  requiredExperience: string;
  availablePositions: number;
}

export interface JobOffer {
  _id?: string;
  userId?: string;
  companyName: string;
  companyImage: string;
  companyLocation: {
    state: string;
    municipality: string;
    address: string;
  };
  description: string;
  positions: JobPosition[];
  createdAt?: Date;
  updatedAt?: Date;
} 