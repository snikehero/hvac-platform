/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { TelemetryDto } from './dto/telemetry.dto';
import { HvacGateway } from './hvac.gateway';

@Injectable()
export class HvacService {
  private latestTelemetry: TelemetryDto[] = [];

  constructor(private readonly hvacGateway: HvacGateway) {}

  handleTelemetry(topic: string, payload: any) {
    const telemetry = this.parseTopic(topic, payload);

    console.log('📊 Telemetría normalizada:', telemetry);

    // guardar último valor
    this.storeLatest(telemetry);

    // emitir a frontend
    this.hvacGateway.sendTelemetry(telemetry);
  }

  getLatestTelemetry(): TelemetryDto[] {
    return this.latestTelemetry;
  }

  private storeLatest(data: TelemetryDto) {
    // clave única por estación + punto
    const key = `${data.stationId}-${data.pointKey}`;

    const index = this.latestTelemetry.findIndex(
      (t) => `${t.stationId}-${t.pointKey}` === key,
    );

    if (index >= 0) {
      this.latestTelemetry[index] = data;
    } else {
      this.latestTelemetry.push(data);
    }
  }

  private parseTopic(topic: string, payload: any): TelemetryDto {
    const [, plantId, stationId, pointKey] = topic.split('/');

    return {
      plantId,
      stationId,
      pointKey,
      value: payload.value,
      unit: payload.unit,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      quality: payload.quality || 'GOOD',
    };
  }
}
