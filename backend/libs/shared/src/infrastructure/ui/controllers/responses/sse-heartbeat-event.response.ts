import { ApiProperty } from '@nestjs/swagger';

export class SseHeartbeatEventDataResponse {
  @ApiProperty()
  timestamp!: string;
}

export class SseHeartbeatEventResponse {
  @ApiProperty({ example: 'heartbeat' })
  type!: 'heartbeat';

  @ApiProperty({ type: SseHeartbeatEventDataResponse })
  data!: SseHeartbeatEventDataResponse;
}
