import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

type TopicHandler = (topic: string, payload: unknown) => void;

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  /**
   * Registry of topic pattern handlers.
   * Key: MQTT topic pattern (e.g. "hvac/#", "motor/#")
   * Value: handler function that receives the parsed message
   */
  private readonly topicHandlers = new Map<string, TopicHandler>();

  /** Legacy response handler for command responses (topics ending with /commands/response) */
  private responseHandler: TopicHandler | null = null;

  constructor(private readonly config: ConfigService) {}

  /* ─── Public API ─── */

  registerResponseHandler(fn: TopicHandler) {
    this.responseHandler = fn;
  }

  /**
   * Register a handler for a given MQTT topic pattern.
   * Also subscribes to the topic on the broker.
   */
  registerTopicHandler(topicPattern: string, handler: TopicHandler): void {
    this.topicHandlers.set(topicPattern, handler);
    this.logger.log(`Registered topic handler for "${topicPattern}"`);

    // If client is already connected, subscribe immediately
    if (this.client?.connected) {
      this.subscribeToTopic(topicPattern);
    }
  }

  /**
   * Unregister a handler and unsubscribe from the broker topic.
   */
  unregisterTopicHandler(topicPattern: string): void {
    this.topicHandlers.delete(topicPattern);
    this.unsubscribeFromTopic(topicPattern);
    this.logger.log(`Unregistered topic handler for "${topicPattern}"`);
  }

  subscribeToTopic(topic: string): void {
    if (!this.client) return;
    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error(`Subscribe error on topic "${topic}"`, err.message);
      } else {
        this.logger.log(`Subscribed to ${topic}`);
      }
    });
  }

  unsubscribeFromTopic(topic: string): void {
    if (!this.client) return;
    this.client.unsubscribe(topic, (err: Error | undefined) => {
      if (err) {
        this.logger.error(`Unsubscribe error on topic "${topic}"`, err.message);
      } else {
        this.logger.log(`Unsubscribed from ${topic}`);
      }
    });
  }

  publish(topic: string, payload: object): void {
    this.client.publish(topic, JSON.stringify(payload));
    this.logger.log(`Published to ${topic}`);
  }

  /* ─── Lifecycle ─── */

  onModuleInit() {
    const brokerUrl = this.config.get<string>(
      'MQTT_BROKER_URL',
      'mqtt://mosquitto:1883',
    );

    this.logger.log(`Connecting to MQTT broker at ${brokerUrl}`);

    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      this.logger.log('Connected to broker');

      // Subscribe to all registered topic patterns
      for (const pattern of this.topicHandlers.keys()) {
        this.subscribeToTopic(pattern);
      }
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
        const raw: unknown = JSON.parse(message.toString());

        // Route command responses to the dedicated response handler
        if (topic.endsWith('/commands/response') && this.responseHandler) {
          this.responseHandler(topic, raw);
          return;
        }

        // Route to matching topic handler
        this.routeMessage(topic, raw);
      } catch (err) {
        this.logger.error(
          `JSON parse error on topic "${topic}"`,
          (err as Error).message,
        );
      }
    });
  }

  /* ─── Internal ─── */

  /**
   * Match incoming topic against registered patterns and dispatch to handler.
   * Patterns use MQTT-style matching: "hvac/#" matches "hvac/plant1/ahu1"
   */
  private routeMessage(topic: string, payload: unknown): void {
    for (const [pattern, handler] of this.topicHandlers) {
      if (this.topicMatchesPattern(topic, pattern)) {
        handler(topic, payload);
        return;
      }
    }

    this.logger.debug(`No handler registered for topic "${topic}"`);
  }

  /**
   * Check if a topic matches an MQTT-style pattern.
   * Supports '#' (multi-level wildcard) and '+' (single-level wildcard).
   */
  private topicMatchesPattern(topic: string, pattern: string): boolean {
    const topicParts = topic.split('/');
    const patternParts = pattern.split('/');

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '#') {
        return true; // '#' matches everything from this level onwards
      }
      if (patternParts[i] === '+') {
        if (i >= topicParts.length) return false;
        continue; // '+' matches any single level
      }
      if (i >= topicParts.length || patternParts[i] !== topicParts[i]) {
        return false;
      }
    }

    return topicParts.length === patternParts.length;
  }
}
