/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { HvacService } from '../hvac/hvac.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  constructor(
    private readonly hvacService: HvacService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const brokerUrl = this.config.get<string>('MQTT_BROKER_URL', 'mqtt://mosquitto:1883');
    const topic = this.config.get<string>('MQTT_TOPIC', 'hvac/#');

    this.logger.log(`Connecting to MQTT broker at ${brokerUrl}`);

    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      this.logger.log('Connected to broker');
      this.client.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`Subscribe error on topic "${topic}"`, err.message);
        } else {
          this.logger.log(`Subscribed to ${topic}`);
        }
      });
    });

    this.client.on('error', (err) => {
      this.logger.error('Connection error', err.message);
    });

    this.client.on('offline', () => {
      this.logger.warn('Client went offline, will attempt to reconnect');
    });

    this.client.on('reconnect', () => {
      this.logger.log('Attempting to reconnect to broker');
    });

    this.client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        this.hvacService.handleTelemetry(payload);
      } catch (err) {
        this.logger.error(`JSON parse error on topic "${topic}"`, (err as Error).message);
      }
    });
  }
}
