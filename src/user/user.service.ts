import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { UserPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly hashService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const alreadyExist = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (alreadyExist) {
      throw new ConflictException('Email has already been used');
    }
    const data = {
      ...createUserDto,
      password: await this.hashService.hash(createUserDto.password),
    };

    const newUser = this.userRepository.create(data);
    await this.userRepository.save(newUser);

    delete newUser.password;

    return {
      message: 'Registered successfully',
      data: { user: newUser },
    };
  }

  async findAll() {
    return await this.userRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number, userPayload: UserPayloadDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (userPayload.sub != id) {
      throw new ForbiddenException(
        'You do not have permission access/edit other users',
      );
    }

    if (!user) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    userPayload: UserPayloadDto,
  ) {
    if (userPayload.sub != id) {
      throw new ForbiddenException(
        'You do not have permission access/edit other users',
      );
    }
    const partialUpdateUserDto = {
      name: updateUserDto.name,
      cpf: updateUserDto.cpf,
      password: updateUserDto.password,
    };

    if (partialUpdateUserDto?.password) {
      partialUpdateUserDto.password = await this.hashService.hash(
        partialUpdateUserDto.password,
      );
    }

    const user = await this.userRepository.preload({
      id,
      ...partialUpdateUserDto,
    });

    if (!user) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    await this.userRepository.save(user);

    delete user.password;

    return {
      message: 'User updated',
      data: user,
    };
  }

  async remove(id: number, userPayload: UserPayloadDto) {
    if (userPayload.sub != id) {
      throw new ForbiddenException(
        'You do not have permission access/edit other users',
      );
    }
    const user = await this.userRepository.preload({
      id,
      deletedAt: new Date(),
    });

    if (!user) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    await this.userRepository.save(user);

    return {
      message: 'User deleted',
      data: [],
    };
  }
}
