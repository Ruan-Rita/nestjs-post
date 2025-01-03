import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import {
  HttpException,
  HttpStatus,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';

export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOneBy({
      email: loginDto.email,
    });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    if (
      !(await this.hashingService.compare(loginDto.password, user.password))
    ) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    return await this.createTokens(user);
  }

  async refreshToken(incomingToken: RefreshTokenDto) {
    try {
      const tokenData = await this.jwtService.verifyAsync(
        incomingToken.refreshToken,
        this.jwtConfiguration,
      );

      if (!tokenData) {
        throw new UnauthorizedException();
      }

      const user = await this.userRepository.findOneBy({ id: tokenData.sub });

      return await this.createTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private async signJwt<t>(sub: number, expiresIn: number, payload?: t) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  private async createTokens(user: User) {
    const accessToken = await this.signJwt<Partial<User>>(
      user.id,
      this.jwtConfiguration.jwtTtl,
      { email: user.email },
    );

    const refreshToken = await this.signJwt(
      user.id,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
