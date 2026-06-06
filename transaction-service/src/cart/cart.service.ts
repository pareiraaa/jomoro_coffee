import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
    constructor(
        private prisma: PrismaService,
    ) {}

    //get product
    private async getProduct(product_id: number){
        try{
            const response = await axios.get(`http://localhost:3002/products/${product_id}`);
            return response.data;
        } catch (error) {
            throw new NotFoundException('Product not found');
        }
    }


    //get cart
    async getCart(user_id: number){
        const cart = await this.prisma.carts.findFirst({
            where: {
                user_id: user_id
            },
            include: {
                cart_items: true
            }
        });

        if(!cart){
            throw new NotFoundException('Cart not found');
        }

        if(cart.cart_items.length === 0){
            throw new NotFoundException('Cart is empty');
        }
        
        const cartItems = await Promise.all(cart.cart_items.map(async (item) => {
            const product = await this.getProduct(item.product_id);
            return {
                product_id: item.product_id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            }
        }))

        return {
            cart_id: cart.id,
            cartItems
        }
    }

    //add item to cart
    async addToCart(userId: number, dto: AddCartDto){
        const { product_id, quantity } = dto;

        let cart = await this.prisma.carts.findFirst({
            where: {
                user_id: userId
            },
            include: {
                cart_items: true
            }
        })

        if(!cart){
            cart = await this.prisma.carts.create({
                data: {
                    user_id: userId
                },
                include: {
                    cart_items: true
                }
            })
        }
        
        const existingCartItem = cart.cart_items.find((item: any) => item.product_id === product_id);

        if(existingCartItem){
            throw new BadRequestException('Product already in cart, please update the quantity instead');
        }
        
        //check quantity
        await this.checkStock(product_id, quantity);

        //add item to cart
        await this.prisma.cart_items.create({
            data:{
                cart_id: cart.id,
                product_id: product_id,
                quantity: quantity,
            }
        })

        return {
            message: 'Product added to cart successfully',
        }
    }

    //update
    async updateCartItem(userId: number, product_id: number, dto: UpdateCartDto){
        const {quantity} = dto

        const cart = await this.checkUserCart(userId);
        const cartItem = this.checkCartItem(cart, product_id);
        await this.checkStock(product_id, quantity);

        //update cart item
        await this.prisma.cart_items.update({
            where: {
                id: cartItem.id,
             },
             data: {
                quantity: quantity,
            }
        })

        return {
            message: 'Cart item updated successfully',
        }
    }

    //delete cart item
    async deleteCartItem(userId: number, product_id: number){

        const cart = await this.checkUserCart(userId);
        const cartItem = this.checkCartItem(cart, product_id);

        //delete cart item
        await this.prisma.cart_items.delete({
            where: {
                id: cartItem.id,
            }
        })

        return {
            message: 'Cart item deleted successfully',
        }
    }

    //clear cart item
    async clearCart(userId: number){
        const cart = await this.checkUserCart(userId);
        
        //delete cart items
        await this.prisma.cart_items.deleteMany({
            where: {
                cart_id: cart.id,
            }
        })

        return {
            message: 'Cart cleared successfully',
        }
    }

    //check if user got cart
    private async checkUserCart(userId: number){
        const cart = await this.prisma.carts.findFirst({
            where: {
                user_id: userId,
            },
            include: {
                cart_items: true,
            }
        });

        if(!cart){
            throw new NotFoundException('Cart not found');
        }
        
        return cart;
    }

    //check if item in cart
    private checkCartItem(cart: any, product_id: number){
        const cartItem = cart.cart_items.find((item: any) => item.product_id === product_id);
        
        if(!cartItem){
            throw new NotFoundException('Product not found in cart');
        }
        
        return cartItem;
    }

    //check if stock is sufficient
    private async checkStock(product_id: number, quantity: number){
        const product = await this.getProduct(product_id);
        
        if(quantity > product.stock){
            throw new BadRequestException('Insufficient product quantity');
        }
    }
}
