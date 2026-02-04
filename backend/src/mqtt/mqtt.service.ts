import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;

  onModuleInit() {
    this.client = mqtt.connect('mqtt://mosquitto:1883', {
      clientId: 'backend-hvac',
    });

    this.client.on('connect', () => {
      console.log('✅ Backend conectado a MQTT');
      this.client.subscribe('hvac/#');
    });

    this.client.on('message', (topic, payload) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = JSON.parse(payload.toString());
      console.log(`📥 ${topic}`, message);
      // aquí se normaliza y guarda
    });
  }
}
