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
  deviceId: string
  status: StreamStatus
  streamUrl: string
  media: string
  poster: string
  createdAt: string
}

export interface ProjectStreamCollection {
  slug: string
  title: string
  poster: string
  date: string
  client?: ProjectClient
  status: StreamStatus
  streams: ProjectStream[]
}
