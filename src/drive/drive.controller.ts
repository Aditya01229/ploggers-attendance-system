import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DriveService } from './drive.service';
import { CreateDriveDto } from './dto/create-drive.dto';
import { CreateDriveLocationDto } from './dto/drive-location.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateDriveDto } from './dto/update-drive.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Drive')
@Controller('drive')
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-admin'))
  @Post('newdrive')
  @ApiOperation({ description: 'Create a new drive' , summary: 'Input - all details of drive + admin Token , output - Drive details'})
  async createDrive(@Body() createDriveDto: CreateDriveDto) {
    return this.driveService.createDrive(createDriveDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-admin'))
  @Post('newlocation')
  @ApiOperation({ description: 'Create a new Location' , summary: 'Input - location + admin Token , output - Location Id'})
  async createDriveLocation(@Body() createDriveLocationData: CreateDriveLocationDto) {
    return this.driveService.createDriveLocation(createDriveLocationData);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-admin'))
  @Get('alllocations')
  @ApiOperation({ description: 'Get all Locations' , summary: 'Input - admin Token , output - All Locations \n Note: We will fetch this api when the admin is creating a drive and admin will select one of the location to link the drive with location.'})
  async getAllLocations() {
    return this.driveService.findAllLocations();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-admin'))
  @Get('alldrives')
  @ApiOperation({ description: 'Get all Drives' , summary: 'Input - admin Token , output - All Drives with location details'})
  async getAllDrives() {
    return this.driveService.findAllDrives();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-admin'))
  @Get(':id')
  @ApiOperation({ description: 'Get Drive by Id' , summary: 'Input - Drive Id as param + admin Token , output - Drive details'})
  async findOne(@Param('id') id: string) {
    return this.driveService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-admin'))
  @Patch(':id')
  @ApiOperation({ description: 'Update Drive by Id' , summary: 'Input - Drive Id as param + Drive details + admin Token , output - Updated Drive details'})
  async update(@Param('id') id: string, @Body() updateDriveData: UpdateDriveDto) {
    return this.driveService.update(+id, updateDriveData);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-admin'))
  @Get('date/:date')
  @ApiOperation({ description: 'Get Drive by Date' , summary: 'Input - Date as param + admin Token , output - Drive details'})
  async findByDate(@Param('date') date: string) {
    return this.driveService.findByDate(date);
  }
}
