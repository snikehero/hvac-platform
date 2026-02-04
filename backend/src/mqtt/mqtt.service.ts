/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { HvacService } from '../hvac/hvac.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;

  constructor(private readonly hvacService: HvacService) {}

  onModuleInit() {
    console.log('[MQTT] Initializing MQTT service');

    this.client = mqtt.connect('mqtt://mosquitto:1883');

    this.client.on('connect', () => {
      console.log('[MQTT] Connected to broker');
      this.client.subscribe('hvac/#', (err) => {
        if (err) {
          console.error('[MQTT] Subscribe error', err);
        } else {
          console.log('[MQTT] Subscribed to hvac/#');
        }
      });
    });

    this.client.on('message', (topic, message) => {
      console.log('[MQTT] Message received:', topic);
      console.log('[MQTT] Payload:', message.toString());

      try {
        const payload = JSON.parse(message.toString());
        this.hvacService.handleTelemetry(payload);
      } catch (err) {
        console.error('[MQTT] JSON parse error', err);
      }
    });
  }
}
