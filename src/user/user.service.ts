import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService,) { }

  async userDetail(userId: number) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
      });
      delete user.password;
      return {
        message: 'User Details',
        user,
      }

    } catch (error) {
      console.error("error in user detail", error);
      throw error;
    }
  }

  async markAttendance(temporaryToken: string, userId: number) {
    try {

      const drive = await this.databaseService.drive.findFirst({
        where: { temporaryToken },
        orderBy: { date: 'desc' },
        include: { users: true },
      });

      if (!drive) {
        throw new NotFoundException('Drive not found or token is invalid.');
      }

      const currDate = new Date();
      if (drive.expiryDate < currDate) {
        throw new BadRequestException('Token has expired.');
      }

      const isAttendaceAlreadyMarked = drive.users.some(user => user.id === userId);
      if (isAttendaceAlreadyMarked) {
        throw new BadRequestException('Attendance is already Marked');
      }

      await this.databaseService.drive.update({
        where: { id: drive.id },
        data: {
          users: {
            connect: { id: userId },
          },
          volunteerCount: {
            increment: 1,
          },
        },
      });

      await this.databaseService.user.update({
        where: { id: userId },
        data: {
          drivescount: {
            increment: 1,
          },
        },
      });

      return { message: 'Attendance marked successfully.' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error("error in mark attendance", error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async drivesAttended(userId: number) {
    try {
      const attended = await this.databaseService.user.findUnique({
        where: { id: userId },
        include: { drives: true },
      });

      if(attended.drives.length === 0) {
        return {
          message: 'No drives attended',
          drives: [],
        };
      }

      const drivesWithLocations = await Promise.all(attended.drives.map(async (drive) => {
        const location = await this.databaseService.driveLocation.findUnique({
          where: { id: drive.locationId },
        });
        return { ...drive, location: location?.location };
      }));

      return {
        message: 'Drives Attended',
        drives: drivesWithLocations,
      };
    } catch (error) {
      console.error("Error in drives attended:", error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
