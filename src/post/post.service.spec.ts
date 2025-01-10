import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { UserService } from 'src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Post } from './entity/post.entity';
import { HashingService } from 'src/auth/hashing/hashing.service';

describe('PostService', () => {
  let service: PostService;
  let userService: UserService;
  let userRepository: Repository<User>;
  let postRepository: Repository<Post>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(), // Métodos do repositório que você planeja usar
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Post),
          useValue: {
            find: jest.fn(), // Métodos do repositório que você planeja usar
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        UserService,
      ],
      imports: [],
    }).compile();

    service = module.get<PostService>(PostService);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    hashingService = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
