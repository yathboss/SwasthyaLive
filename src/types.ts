export type DoctorStatus = "Available" | "Busy" | "Break" | "OffDuty";
export type MedicineStatus = "Available" | "Low" | "Out";
export type AlertSeverity = "info" | "warning" | "critical";

export interface PHCAlert {
  message: string;
  severity: AlertSeverity;
  until?: string; // ISO string (optional)
}

export interface PHCStatusDoc {
  phcId: string;
  doctorStatus: DoctorStatus;
  queueCount: number;
  nowServing: string;
  avgConsultMins: number;
  alerts: PHCAlert[];
  medicines: Record<string, MedicineStatus>;

  readinessScore: number;          // 0..100
  predictedWaitMins: number | null; // null if OffDuty
  updatedAt: any; // Firestore Timestamp
}

export type TeleOPDCategory = "General" | "Fever" | "Maternal" | "Child" | "Other";
export type TeleOPDStatus = "requested" | "confirmed" | "done" | "cancelled";

export interface TeleOPDBookingDoc {
  phcId: string;
  category: TeleOPDCategory;
  slot: string; // ISO string
  status: TeleOPDStatus;
  createdAt: any; // Firestore Timestamp
}

export interface SOPCompletionItem {
  sopId: string;
  completedAt: any; // Firestore Timestamp
}

export interface StaffLearningCompletionDoc {
  roleOrUser: string;
  items: SOPCompletionItem[];
}
