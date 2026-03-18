export interface PublicReport {
  vin: string;
  plate?: string;
  make?: string;
  model?: string;
  year?: number;
}

export interface PrivateReport extends PublicReport {
  id?: number;
  mileage?: number;
  valuation?: number;
  insurance_status?: string;
  owners_count?: number;
  last_checked?: string;
  accident_history?: any[];
  service_records?: any[];
  impound_history?: any[];
  ownership_history?: any[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}