import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/jwt-auth/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ReduceStockDto } from './dto/reduce-product.dto';

@ApiTags('products')
@Controller()
export class ProductController {
    constructor(
        private productService: ProductService
    ) {}

    //public routes
    @Get('products')
    async getAllProducts(){
        return await this.productService.getAllProducts();
    }

    @Get('products/:id')
    async getProductById(@Param('id', ParseIntPipe) id: number){
        return await this.productService.getProductById(id);
    }

    @Get('categories')
    async getAllcategories(){
        return await this.productService.getAllCategories();
    }

    @Get('categories/:id/products')
    async getProductsByCategoryId(@Param('id', ParseIntPipe) id: number){
        return await this.productService.getProductsByCategoryId(id);
    }

    //admin routes
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
    @Post('admin/products')
    async createProduct(@Body() dto: CreateProductDto){
        return await this.productService.createProduct(dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
    @Post('admin/products/:id/update')
    async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProductDto){
        return await this.productService.updateProduct(id, dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
    @Post('admin/products/:id/reduce')
    async reduceProductStock(@Param('id', ParseIntPipe) id: number, @Body() dto: ReduceStockDto){
        return await this.productService.reduceProductStock(id, dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
    @Post('admin/products/:id/delete')
    async deleteProduct(@Param('id', ParseIntPipe) id: number){
        return await this.productService.deleteProduct(id);
    }

    //internal endpoint
    @Post('internal/products/:id/reduce')
    async reduceStockInternal(@Param('id', ParseIntPipe) id: number, @Body() dto: ReduceStockDto) {
        return this.productService.reduceProductStock(id, dto);
    }


}
