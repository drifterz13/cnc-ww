import { Injectable } from '@nestjs/common';
import { AuditRepo } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepo: AuditRepo) {}

  findAllReservationHistory() {
    return this.auditRepo.findAllReservationHistory();
  }
}
