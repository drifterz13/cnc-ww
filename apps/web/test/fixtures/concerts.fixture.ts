export const availableConcert = {
  id: 1,
  name: 'My Concert',
  description: 'A free outdoor concert',
  totalSeats: 100,
  availableSeats: 100,
  createdAt: '2026-07-12T00:00:00.000Z',
};

export const soldOutConcert = {
  ...availableConcert,
  id: 2,
  name: 'Sold Out Concert',
  availableSeats: 0,
};

export const activeReservation = {
  id: 1,
  status: 'ACTIVE' as const,
  reservedAt: '2026-07-12T01:00:00.000Z',
  cancelledAt: null,
  concert: {
    id: availableConcert.id,
    name: availableConcert.name,
    description: availableConcert.description,
  },
};

export const auditReservation = {
  id: 1,
  status: 'ACTIVE' as const,
  reservedAt: '2026-07-12T01:00:00.000Z',
  cancelledAt: null,
  user: {
    id: 1,
    email: 'user1@concert-wow.test',
  },
  concert: {
    id: availableConcert.id,
    name: availableConcert.name,
  },
};

export const cancelledAuditReservation = {
  id: 2,
  status: 'CANCELLED' as const,
  reservedAt: '2026-07-12T02:00:00.000Z',
  cancelledAt: '2026-07-12T03:00:00.000Z',
  user: {
    id: 2,
    email: 'user2@concert-wow.test',
  },
  concert: {
    id: soldOutConcert.id,
    name: soldOutConcert.name,
  },
};
