export interface Movie {
  id: number;
  title: string;
  durationMinutes: number;
  releaseDate: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Screening {
  id: number;
  movieId: number;
  roomId: number;
  screeningTime: string;
}

export interface ScreeningRoom {
  id: number;
  roomNumber: number;
  capacity: number;
}

export interface Staff {
  id: number;
  firstName: string;
  lastName: string; 
  roleId: number;
}

export interface StaffRole {
  id: number;
  roleName: string;
  description?: string;
}

export interface Ticket {
  id: number;
  screeningId: number;
  seatNumber: number;
  price: number;
}

export interface Booking {
  id: number;
  customerId: number;
  ticketId: number;
}
