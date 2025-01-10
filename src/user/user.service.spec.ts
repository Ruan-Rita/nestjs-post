import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';
import { UserPayloadDto } from 'src/auth/dto/token-payload.dto';

describe('UserService', () => {
  let userService: UserService;
  let hashingService: HashingService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    hashingService = module.get<HashingService>(HashingService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('CreateUser', () => {
    it('should create a new user', async () => {
      const userDto: CreateUserDto = {
        cpf: '123123123123',
        email: 'ruan@mail.com',
        name: 'ruan',
        password: '1234567',
        routePolicies: [],
      };

      const newUser = {
        id: 1,
        ...userDto,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue('!@ASDASD@!');
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as User);

      const result = await userService.create(userDto);

      // assert
      expect(hashingService.hash).toHaveBeenCalledWith(userDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...userDto,
        password: '!@ASDASD@!',
      });
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result.data.user).toEqual(newUser);
    });

    it('must throw duplicate email error', async () => {
      const userDto: CreateUserDto = {
        cpf: '123123123123',
        email: 'ruan@mail.com',
        name: 'ruan',
        password: '1234567',
        routePolicies: [],
      };

      // Simula que o repositório encontra um usuário com o mesmo email
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(userDto as User);

      // Espera que o serviço lance uma ConflictException
      // Verifica a mensagem da exceção lançada
      await expect(userService.create(userDto)).rejects.toThrow(
        new ConflictException('Email has already been used'),
      );
    });
  });

  describe('findOne', () => {
    it('should find user', async () => {
      const idUser = 1;

      const foundUser = {
        id: idUser,
        cpf: '123123123123',
        email: 'ruan@mail.com',
        name: 'ruan',
        password: '1234567',
      };

      const userPayload = {
        sub: 1,
      } as UserPayloadDto;

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(foundUser as User);

      const result = await userService.findOne(idUser, userPayload);
      expect(result).toEqual(foundUser);
    });

    it('should test if user doesnt access others users without permission', async () => {});
  });
});
