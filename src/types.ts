export type PatientCategory = 'ติดเตียง' | 'ติดบ้าน' | 'ติดสังคม';
export type ActivityType = 'แจ้งเตือน' | 'เข้าเยี่ยม' | 'นัดหมาย';
export type ActivityStatus = 'Danger' | 'Normal' | 'Warning';

export interface Patient {
  id: string;
  name: string;
  category: PatientCategory;
  address: string;
  moo?: string;
  vitalSigns: string;
  caregiver: string;
  lat: number;
  lng: number;
  lastVisited: string;
  phone: string;
}

export interface Activity {
  timestamp: string;
  patientName: string;
  caregiverName: string;
  type: ActivityType;
  description: string;
  status: ActivityStatus;
}

export interface DashboardStats {
  totalPopulation: number;
  bedboundCount: number;
  homeboundCount: number;
  socialCount: number;
  activeUsers: number;
  mobilePercentage: number;
  desktopPercentage: number;
}
