import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditService } from './audit.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('reservations')
  @AdminOnly()
  findAllReservationHistory() {
    return this.auditService.findAllReservationHistory();
  }
}
