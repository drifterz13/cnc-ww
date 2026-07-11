import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateConcertDto } from './dto/create-concert.dto';
import { ConcertsService } from './concerts.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get('manage')
  @AdminOnly()
  findAll() {
    return this.concertsService.findAll();
  }

  @Post()
  @AdminOnly()
  create(@Body() dto: CreateConcertDto) {
    return this.concertsService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AdminOnly()
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.concertsService.delete(id);
  }
}
