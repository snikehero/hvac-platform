import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  /** Timeout in ms before a pending command is marked as TIMEOUT */
  commandTimeoutMs: parseInt(process.env.COMMAND_TIMEOUT_MS ?? '10000', 10),
  /** Interval in ms for the connectivity check loop */
  connectivityCheckMs: parseInt(process.env.CONNECTIVITY_CHECK_MS ?? '5000', 10),
  /** Time in ms without an update before a device is marked as DISCONNECTED */
  disconnectTimeoutMs: parseInt(process.env.DISCONNECT_TIMEOUT_MS ?? '60000', 10),
}));
