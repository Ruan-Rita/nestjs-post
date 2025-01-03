import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { UserService } from 'src/user/user.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private userService: UserService,
  ) {}

  async getAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 0 } = paginationDto;

    return await this.postRepository.find({
      take: limit,
      skip: page * limit,
    });
  }

  async findById(id: number) {
    const result = await this.postRepository.findOneBy({ id });

    if (!result) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  async create(data: CreatePostDto, userPayload: UserPayloadDto) {
    const user = await this.userService.findOne(data.ownerId, userPayload);

    const newPost = {
      name: data.name,
      category: data.category,
      owner: user,
    };

    const post = this.postRepository.create(newPost);
    const createdPost = await this.postRepository.save(post);

    return {
      message: 'Created Post',
      data: {
        ...createdPost,
        owner: {
          id: user.id,
          name: user.name,
        },
      },
    };
  }

  async update(id: number, data: UpdatePostDto) {
    const partialUpdatePostDto = {
      category: data?.category,
    };

    const post = await this.postRepository.preload({
      id,
      ...partialUpdatePostDto,
    });

    if (!post) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    await this.postRepository.save(post);

    return {
      message: 'Updated post',
      data: post,
    };
  }

  async delete(id: number) {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    await this.postRepository.remove(post);

    return 'Removed successfully';
  }
}
