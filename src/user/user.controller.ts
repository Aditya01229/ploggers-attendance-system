import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-user'))
  @Get('details')
  @ApiOperation({ description: 'Get User Details' , summary: 'Input - User Token , output - User details'})
  async userDetail(@UserId() userId: number) {
    return this.userService.userDetail(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-admin'))
  @Get('details/:id')
  @ApiOperation({ description: 'Get User Details by Id (for admin)' , summary: 'Input - User Id as param + Admin Token , output - User details'})
  findOne(@Param('id') id: string) {
    return this.userService.userDetail(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-user'))
  @Post('attendance')
  @ApiOperation({ description: 'Mark Attendance' , summary: 'Input - Temporary (OTP) + user Token , output - Success message'})
  async markAttendance(@Body() MarkAttendanceData: MarkAttendanceDto, @UserId() userId: number) {
    return this.userService.markAttendance(MarkAttendanceData.temporaryToken, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-user'))
  @Get('drivesattended')
  @ApiOperation({ description: 'Get Drives Attended' , summary: 'Input - User Token , output - List of Drives attended by the user'})
  async drivesAttended(@UserId() userId: number) {
    return this.userService.drivesAttended(userId);
  }
}
