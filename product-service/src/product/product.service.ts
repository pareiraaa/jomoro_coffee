import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ReduceStockDto } from './dto/reduce-product.dto';

@Injectable()
export class ProductService {
    constructor(
        private prisma: PrismaService
    ) {}

    //for public
    //get all products
    async getAllProducts(){
        return await this.prisma.products.findMany({
            include: {
                category: true,
            }
        });
    }

    //get product detail by id
    async getProductById(id: number){
        const product = await this.prisma.products.findUnique({
            where:{
                id: id,
            }, 
            include:{
                category: true,
            }
        })

        if(!product){
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    //get all categories
    async getAllCategories(){
        return await this.prisma.categories.findMany();
    }

    //filter product by category id
    async getProductsByCategoryId(category_id: number){
        return await this.prisma.products.findMany({
            where:{
                category_id: category_id,
            },
            include:{
                category: true, 
            }
        })
    }

    //for admin
    async createProduct(dto: CreateProductDto){
        const { name, description, price, stock, image_url, category_id } = dto;

        this.nameValidation(name);
        this.descriptionValidation(description);
        await this.categoryValidation(category_id);

        //create product
        const product = await this.prisma.products.create({
            data: {
                name,
                description,
                price,
                stock,
                image_url,
                category_id,
            }
        })

        return {
            message: 'Product created successfully',
            product,
        };
    }

    //update product
    async updateProduct(id: number, dto: CreateProductDto){
        const { name, description, price, stock, image_url, category_id } = dto;
        
        await this.getProductById(id);
        this.nameValidation(name);
        this.descriptionValidation(description);
        await this.categoryValidation(category_id);

        const updatedProduct = await this.prisma.products.update({
            where: {
                id: id,
            },
            data: {
                name,
                description,
                price,
                stock,
                image_url,
                category_id,
            }
        });

        return {
            message: 'Product updated successfully',
            product: updatedProduct,
        };
    }

    //reduce product stock
    async reduceProductStock(id: number, dto: ReduceStockDto){
        const { quantity } = dto;

        const product = await this.getProductById(id);

        //stock validation
        if(product.stock < quantity){
            throw new BadRequestException('Insufficient stock');
        }

        await this.prisma.products.update({
            where: {
                id: id,
            },
            data: {
                stock: product.stock - quantity,
            }
        })

        return {
            message: 'Product stock reduced successfully',
        };
    }

    //delete product
    async deleteProduct(id: number){
        await this.getProductById(id);

        await this.prisma.products.delete({
            where: {
                id: id,
            }
        })

        return {
            message: 'Product deleted successfully',
        };
    }

    //validasi product name
    private nameValidation(name: string){
        const wordCount = name.trim().split(/\s+/).length;
        if(wordCount < 3){
            throw new BadRequestException('Product name must be at least 3 words');
        }
    }

    //validasi desc
    private descriptionValidation(description: string){
        if(description.length < 20){
            throw new BadRequestException('Product description must be at least 20 characters');
        }
    }

    //category validation
    private async categoryValidation(category_id: number){
        const category = await this.prisma.categories.findUnique({
            where: {
                id: category_id,
            }
        })
        
        if(!category){
            throw new BadRequestException('Category not found');
        }
    }
}
