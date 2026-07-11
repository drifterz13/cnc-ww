import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AdminOnly } from '../common/decorators/roles.decorator';
import { CreateConcertDto } from './dto/create-concert.dto';
import { ConcertsService } from './concerts.service';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

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
