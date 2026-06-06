import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService
    ){}

    //get product
    private async getProduct(product_id: number){
        try{
            const response = await axios.get(`http://localhost:3002/products/${product_id}`);
            return response.data;
        } catch (error) {
            throw new NotFoundException('Product not found');
        }
    }

    //checkout
    async checkout(user_id: number){
        const cart = await this.checkUserCart(user_id)

        if(cart.cart_items.length === 0){
            throw new BadRequestException('Cart is empty')
        }

        //new order
        const order = await this.prisma.orders.create({
            data: {
                user_id
            }
        })

        //new order detail
        for(const item of cart.cart_items){
            const product = await this.getProduct(item.product_id)

            await this.prisma.order_details.create({
                data: {
                    order_id: order.id,
                    product_id: item.product_id,
                    price: product.price,
                    quantity: item.quantity
                }
            })

            //update stock
            await axios.post(`http://localhost:3002/internal/products/${item.product_id}/reduce`, {
                quantity: item.quantity
            })
        }

        //clear cart
        await this.prisma.cart_items.deleteMany({
            where: {
                cart_id: cart.id
            }
        })

        return {
            message: 'Checkout succesfull'
        }
    }

    //get order
    async getOrders(user_id: number){
        const orders = await this.prisma.orders.findMany({
            where: {
                user_id
            },
            include: {
                order_details: true
            }
        })

        return orders
    }

    //get order detail
    async getOrderDetail(user_id: number, order_id: number){
        const order = await this.prisma.orders.findFirst({
            where: {
                id: order_id,
                user_id
            },
            include: {
                order_details: true
            }
        })

        if(!order){
            throw new NotFoundException('No orders found')
        }

        //get detail
        const details = await Promise.all(
            order.order_details.map(async (detail) => {
                const product = await this.getProduct(detail.product_id);
                return {
                    product_id: detail.product_id,
                    name: product.name,
                    quantity: detail.quantity,
                    price: detail.price
                }
            })
        )

        return {
            order_id: order_id,
            created_at: order.created_at,
            details
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
}
