/* eslint-disable @typescript-eslint/no-unsafe-assignment */
console.log('🚀 MqttService file loaded');

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { HvacService } from '../hvac/hvac.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;

  constructor(private readonly hvacService: HvacService) {
    console.log('🧠 MqttService constructor');
  }

  onModuleInit() {
    this.client = mqtt.connect('mqtt://mosquitto:1883', {
      clientId: 'backend-hvac',
    });

    this.client.on('connect', () => {
      console.log('✅ Backend conectado a MQTT');
      this.client.subscribe('hvac/#');
    });

    this.client.on('message', (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        this.hvacService.handleTelemetry(topic, data);
      } catch (err) {
        console.error('❌ Payload inválido', err);
      }
    });

    this.client.on('error', (err) => {
      console.error('❌ Error MQTT', err);
    });
  }
}
