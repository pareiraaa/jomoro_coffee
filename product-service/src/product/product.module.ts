import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from 'src/jwt-auth/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, PrismaService, JwtStrategy]
})
export class ProductModule {}
