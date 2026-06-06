import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
    constructor(
        private cartService: CartService
    ){}

    @Get()
    async retrieveCart(@Req() req){
        return this.cartService.getCart(req.user.id)
    }

    @Post()
    async addItemToCart(@Req() req, @Body() dto: AddCartDto){
        return this.cartService.addToCart(req.user.id, dto)
    }

    @Post(':product_id/update')
    async updateCartItem(@Req() req, @Param('product_id', ParseIntPipe) product_id: number, @Body() dto: UpdateCartDto){
        return this.cartService.updateCartItem(req.user.id, product_id, dto)
    }

    @Post(':product_id/delete')
    async deleteProduct(@Req() req, @Param('product_id', ParseIntPipe) product_id: number){
        return this.cartService.deleteCartItem(req.user.id, product_id)
    }

    @Post('clear')
    async clearCart(@Req() req){
        return this.cartService.clearCart(req.user.id)
    }


}
