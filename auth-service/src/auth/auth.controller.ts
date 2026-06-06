import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/profiles')
    getProfile(@Req() req) {
        return this.authService.getProfile(req.user.id);
    }
}
