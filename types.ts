export type CommissionType = 'FLOWING_SAND' | 'SCREENSHOT';

export interface Step {
  label: string;
  sub: string;
}

export interface AdminUser {
  name: string;
  ownerId: string;
}

export interface Commission {
  id: string; // Firestore Doc ID
  clientId: string; // Internal ID
  clientName: string;
  type: CommissionType;
  status: number;
  note: string;
  ownerId: string;
  ownerName: string;
  updatedAt: number;
}

export interface CommissionFormData {
  clientId: string;
  clientName: string;
  type: CommissionType;
  status: number;
  note: string;
}

// Global variable declarations for the injected environment variables
declare global {
  var __firebase_config: string | object | undefined;
  var __app_id: string | undefined;
  var __initial_auth_token: string | undefined;

  interface Window {
    __firebase_config?: string | object;
    __app_id?: string;
    __initial_auth_token?: string;
  }
}