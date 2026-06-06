import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    async register(dto: RegisterDto) {
        const { first_name, last_name, email, password } = dto;

        //validasi first name
        if(!/^[a-zA-Z]+$/.test(first_name)) {
            throw new BadRequestException('Invalid first name');
        }

        //validasi last name
        if(!/^[a-zA-Z]+$/.test(last_name)){
            throw new BadRequestException('Invalid last name');
        }

        //validasi domain
        const validDomain = ['.com', '.net', '.org', '.id'];
        const isValidDomain = validDomain.some(domain => email.endsWith(domain));
        if(!isValidDomain) {
            throw new BadRequestException('Invalid email domain');
        }

        //validasi password
        if(password.includes(' ')) {
            throw new BadRequestException('Password should not contain spaces');
        }

        if(password.length < 8) {
            throw new BadRequestException('Password should be at least 8 characters long');
        }

        const digitCount = (password.match(/\d/g) || []).length;
        if (digitCount < 2) {
            throw new BadRequestException('Password must contain at least 2 numeric digits');
        }

        //validasi email sudah terdaftar
        const existingUser = await this.prisma.users.findFirst({
            where: {
                email
            }
        })

        if(existingUser) {
            throw new BadRequestException('Email already registered');
        }

        await this.prisma.users.create({
            data: {
                first_name,
                last_name,
                email,
                password,
                role: 'CUSTOMER'
            }
        });

        return {
            message: 'User registered successfully'
        }

    }

    async login(dto: LoginDto) {
        const {email, password} = dto;

        const user = await this.prisma.users.findFirst({
            where:{
                email
            }
        })

        if(!user){
            throw new UnauthorizedException('No email found');
        }

        //cek password
        if(user.password !== password){
            throw new UnauthorizedException('Incorrect password');
        }

        //generate token
        const payload = {
            id: user.id,
            role: user.role
        }
        const token = await this.jwtService.signAsync(payload);

        return {
            message: 'Login successful',
            token
        }
    }
}
