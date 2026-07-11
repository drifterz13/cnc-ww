import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserOnly } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { HistoryService } from './history.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('reservations')
  @UserOnly()
  findReservationHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.historyService.findReservationHistory(user.id);
  }
}
