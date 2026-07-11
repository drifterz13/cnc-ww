import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserOnly } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DiscoveryService } from './discovery.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('concerts')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get()
  @UserOnly()
  findAll() {
    return this.discoveryService.findAll();
  }
}
