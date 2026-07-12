import { delay, http, HttpResponse } from 'msw';
import type {
  AuditReservation,
  Concert,
  ReservationHistory,
} from '@/lib/types';

const apiUrl = 'http://localhost:3000';

export function showConcerts(concerts: Concert[]) {
  return http.get(`${apiUrl}/concerts`, () => HttpResponse.json(concerts));
}

export function showManagedConcerts(concerts: Concert[]) {
  return http.get(`${apiUrl}/concerts/manage`, () =>
    HttpResponse.json(concerts),
  );
}

export function showReservationHistory(history: ReservationHistory[]) {
  return http.get(`${apiUrl}/history/reservations`, () =>
    HttpResponse.json(history),
  );
}

export function showReservationAudit(history: AuditReservation[]) {
  return http.get(`${apiUrl}/audit/reservations`, () =>
    HttpResponse.json(history),
  );
}

export function rejectSignIn(message = 'Invalid email or password') {
  return http.post(`${apiUrl}/auth/login`, () =>
    HttpResponse.json({ message }, { status: 401 }),
  );
}

export function acceptSignIn(accessToken: string) {
  return http.post(`${apiUrl}/auth/login`, () =>
    HttpResponse.json({ accessToken }),
  );
}

export function acceptSignup(accessToken: string) {
  return http.post(`${apiUrl}/auth/signup`, () =>
    HttpResponse.json({ accessToken }, { status: 201 }),
  );
}

export function delaySignInRejection() {
  return http.post(`${apiUrl}/auth/login`, async () => {
    await delay(250);

    return HttpResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 },
    );
  });
}
