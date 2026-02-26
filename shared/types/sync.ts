import type { ProjectClient } from './index'

export enum StreamStatus {
  Idle = 'idle', // registered, nothing started
  Starting = 'starting', // FFmpeg spawning, waiting for SRT connection
  Live = 'live', // SRT connected, actively encoding
  Paused = 'paused', // stream paused, FFmpeg still running
  Stopping = 'stopping', // SIGTERM sent, flushing buffers
  Stopped = 'stopped', // FFmpeg exited cleanly (code 0)
  Error = 'error', // FFmpeg exited with non-zero code
  Processing = 'processing', // post-stream: remux / R2 upload in progress
  Ready = 'ready', // processing done, VOD available
}

export interface ProjectStream {
  slug: string
  deviceId: string
  title: string
  status: StreamStatus
  poster: string
  streamUrl: string
  media: string
  client?: ProjectClient
}
