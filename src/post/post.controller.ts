import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AddHeaderInterceptor } from 'src/common/interceptors/add-header.interceptor';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { REQUEST_USER_PAYLOAD } from 'src/auth/auth.constant';
import { UserPayloadParam } from 'src/auth/params/user-payload-param.params';
import { UserPayloadDto } from 'src/auth/dto/token-payload.dto';
import { RoutePolicyGuard } from 'src/auth/guard/route-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorator/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';

@UseGuards(AuthTokenGuard)
@Controller('post')
@UseInterceptors(AddHeaderInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/')
  @SetRoutePolicy(RoutePolicies.findAllPost)
  @UseGuards(RoutePolicyGuard)
  getPost(@Query() pagination: PaginationDto) {
    return this.postService.getAll(pagination);
  }

  @Get(':id')
  findPost(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userPayload = req[REQUEST_USER_PAYLOAD];
    console.log('testes', userPayload);

    return this.postService.findById(id);
  }

  @Post('/:id/image')
  saveImage() {
    return true;
  }

  @Post('/')
  @SetMetadata('create_post', 'New Post')
  createPost(
    @Body() data: CreatePostDto,
    @UserPayloadParam() userPayload: UserPayloadDto,
  ) {
    return this.postService.create(data, userPayload);
  }

  @Patch('/:id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePostDto,
  ) {
    return this.postService.update(id, data);
  }

  @Delete('/:id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.delete(id);
  }
}
