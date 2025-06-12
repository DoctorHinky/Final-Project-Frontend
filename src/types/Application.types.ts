// src/types/Application.types.ts
export interface ApplicationFormData {
  phone: string;
  email: string;
  expertise: string;
  expertiseOther: string;
  qualifications: string;
  motivation: string;
  sampleTitle: string;
  sampleDescription: string;
  agreeTerms: boolean;
}

export interface ApplicationFiles {
  coverLetter: File | null;
  certification: File | null;
  writingSample: File | null;
}

export interface ApplicationResponse {
  message: string;
  applicationId: string;
  documentsUploaded: number;
}

export interface MyApplicationsResponse {
  message: string;
  data: ApplicationItem[];
}

export interface ApplicationItem {
  id: string;
  status: ApplicationStatus;
  phone: string;
  email: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  referenceDocument: ApplicationDocument[];
}

export interface ApplicationDocument {
  url: string;
}

export type ApplicationStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'CANCELED';

export interface ApplicationSubmitEvent {
  success: boolean;
  message?: string;
  applicationId?: string;
  error?: string;
}

export interface FileValidationError {
  field: string;
  message: string;
}

export interface ApplicationStatusInfo {
  text: string;
  color: string;
  icon: string;
}