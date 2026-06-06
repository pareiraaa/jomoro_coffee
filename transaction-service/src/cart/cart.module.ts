import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from 'src/jwt-auth/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secretKey',
      signOptions: {
        expiresIn: '1d'
      }
    })
  ],
  controllers: [CartController],
  providers: [CartService, PrismaService, JwtStrategy]
})
export class CartModule {}
