import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class MarkAttendanceDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    temporaryToken: string;
}