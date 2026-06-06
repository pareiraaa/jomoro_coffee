import { Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { OrderService } from './order.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  async getOrders(@Req() req) {
    return this.orderService.getOrders(req.user.id);
  }

  @Post(':id')
  async getOrderDetail(
    @Req() req,
    @Param('id', ParseIntPipe) order_id: number,
  ) {
    return this.orderService.getOrderDetail(req.user.id, order_id);
  }

  @Post()
  async checkout(@Req() req) {
    return this.orderService.checkout(req.user.id);
  }
}