import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from '../jwt-auth/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, JwtStrategy],
})
export class OrderModule {}