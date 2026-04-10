import { Controller, Post, Body, Param, Put, Req, UsePipes, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { PlaceOrderSchema, UpdateOrderSchema } from './validators/order.validator';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(PlaceOrderSchema))
  async placeOrder(@Req() req: any, @Body() body: any) {
    // identity
    body.userId = req.user.userId;
    return this.ordersService.placeOrder(body);
  }

  @Put(':id')
  @UsePipes(new JoiValidationPipe(UpdateOrderSchema))
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    // update
    return this.ordersService.updateOrder(id, body);
  }
}
