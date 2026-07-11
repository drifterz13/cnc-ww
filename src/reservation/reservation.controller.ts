import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserOnly } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { ReservationService } from './reservation.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('concerts/:concertId/reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UserOnly()
  reserveSeat(
    @CurrentUser() user: AuthenticatedUser,
    @Param('concertId', ParseIntPipe) concertId: number,
  ) {
    return this.reservationService.reserveSeat(user.id, concertId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UserOnly()
  cancelReservation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('concertId', ParseIntPipe) concertId: number,
  ) {
    return this.reservationService.cancelReservation(user.id, concertId);
  }
}
