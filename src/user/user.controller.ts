import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { UserPayloadParam } from 'src/auth/params/user-payload-param.params';
import { UserPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthTokenGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @UserPayloadParam() userPayload: UserPayloadDto,
  ) {
    return this.userService.findOne(+id, userPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserPayloadParam() userPayload: UserPayloadDto,
  ) {
    return this.userService.update(+id, updateUserDto, userPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @UserPayloadParam() userPayload: UserPayloadDto,
  ) {
    return this.userService.remove(+id, userPayload);
  }
}
