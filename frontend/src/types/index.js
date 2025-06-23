// User Management Types
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin'
};

export const BookingStatus = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
};

export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PaymentMethod = {
  CARD: 'card',
  PAYPAL: 'paypal',
  WALLET: 'wallet'
};

export const BusStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance'
};

export const MaintenanceType = {
  ROUTINE: 'routine',
  EMERGENCY: 'emergency',
  INSPECTION: 'inspection'
};

export const MaintenanceStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

export const SeatType = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  BOOKED: 'booked',
  UNAVAILABLE: 'unavailable'
};