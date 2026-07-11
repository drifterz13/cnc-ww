export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export type ActionState = {
  error: string;
} | null;

export type Concert = {
  id: number;
  name: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
  createdAt: string;
};

export type ReservationStatus = 'ACTIVE' | 'CANCELLED';

export type ReservationHistory = {
  id: number;
  status: ReservationStatus;
  reservedAt: string;
  cancelledAt: string | null;
  concert: Pick<Concert, 'id' | 'name' | 'description'>;
};

export type AuditReservation = {
  id: number;
  status: ReservationStatus;
  reservedAt: string;
  cancelledAt: string | null;
  user: {
    id: number;
    email: string;
  };
  concert: {
    id: number;
    name: string;
  };
};
