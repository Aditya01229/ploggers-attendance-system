import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateDriveDto } from './dto/create-drive.dto';
import { CreateDriveLocationDto } from './dto/drive-location.dto';
import { DatabaseService } from 'src/database/database.service';
import { AdminJwtStrategy } from 'src/auth/strategy/admin-jwt.strategy';
import { UpdateDriveDto } from './dto/update-drive.dto';

@Injectable()
export class DriveService {
  constructor(private databaseService: DatabaseService) { }

  async createDrive(createDriveDto: CreateDriveDto) {
    const { locationId, date, totalHours, expiryDate } = createDriveDto;
    try {
      const isLocationIdValid = await this.databaseService.driveLocation.findUnique({
        where: { id: locationId }
      });
      if (!isLocationIdValid) {
        throw new BadRequestException('Invalid Location Id');
      }
      const temporaryToken = this.generateOtp();
      if (!temporaryToken) {
        throw new InternalServerErrorException('Error generating OTP')
      }
      const drive = await this.databaseService.drive.create({
        data: {
          date,
          locationId,
          totalHours,
          expiryDate,
          temporaryToken,
        }
      })
      return {
        message: 'Drive Created Successfully',
        drive,
      }
    } catch (error) {
      console.error("error in create drive", error);
      throw error;
    }
  }

  async createDriveLocation(createDriveLocationData: CreateDriveLocationDto) {
    const location = createDriveLocationData.location;
    try {
      const driveLocation = await this.databaseService.driveLocation.create({
        data: {
          location,
        }
      })
      return {
        message: 'Drive Location Created Successfully',
        data: driveLocation,
      }
    } catch (error) {
      console.error("error in create drive location", error);
      throw error;
    }
  }

  async findAllDrives() {
    try {
      const drives = await this.databaseService.drive.findMany({
        orderBy:{
          id: 'asc',
        }
      });
      const drivesWithLocations = await Promise.all(
        drives.map(async (drive) => {
          const location = await this.databaseService.driveLocation.findUnique({
            where: {
              id: drive.locationId,
            },
          });
          return { ...drive, location: location.location };
        })
      );
      return drivesWithLocations;
    } catch (error) {
      console.error('Error fetching drives and locations:', error);
      throw new InternalServerErrorException('An error occurred while fetching drives and locations.');
    }
  }

  async findAllLocations() {
    try {
      const locations = await this.databaseService.driveLocation.findMany({
        orderBy: {
          id: 'asc',
        }
      });
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new InternalServerErrorException('An error occurred while fetching locations.');
    }
  }


  async findOne(id: number) {
    try {
      const drive = await this.databaseService.drive.findUnique({
        where: { id }
      });
      if (!drive) {
        throw new BadRequestException('Drive not found');
      }
      return {
        message: 'Drive Found',
        drive,
      }
    } catch (error) {
      console.error('Error fetching one drive:', error);
      throw new InternalServerErrorException('An error occurred while fetching drive.');
    }

  }

  async update(arg0: number, updateDriveData: UpdateDriveDto) {
    const { locationId, date, totalHours, expiryDate } = updateDriveData;
    try {
      const drive = await this.databaseService.drive.update({
        where: { id: arg0 },
        data: {
          date,
          locationId,
          totalHours,
          expiryDate,
        }
      });
      return {
        message: 'Drive Updated Successfully',
        drive,
      }
    } catch (error) {
      console.error('Error updating drive:', error);
      throw new InternalServerErrorException('An error occurred while updating drive.');
    }
  }

  async findByDate(date: string) {
    try {
      const driveDate = new Date(date);
      const drives = await this.databaseService.drive.findMany({
        where: {
          date: driveDate,
        }
      });
      if (drives.length === 0) {
        throw new BadRequestException('No drives found for this date');
      }
      console.log(drives);
      return {
        message: 'Drives found for this date',
        drives,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching drives by date:', error);
      throw new InternalServerErrorException('An error occurred while fetching drives by date.');
    }
  }

  generateOtp() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      otp += chars[randomIndex];
    }
    return otp;
  }
}
