'use client';

import {
  MediaPlayer,
  MediaPlayerVideo,
  MediaPlayerControls,
  MediaPlayerPlay,
  MediaPlayerSeek,
  MediaPlayerTime,
  MediaPlayerVolume,
  MediaPlayerFullscreen,
  MediaPlayerLoading,
  MediaPlayerError,
} from '@/components/ui/media-player';

export function SimpleMediaPlayer({ src, className, ...props }) {
  return (
    <MediaPlayer className={className} autoHide={false} {...props}>
      <MediaPlayerVideo src={src} />
      <MediaPlayerLoading />
      <MediaPlayerError />
      <MediaPlayerControls className="pointer-events-auto">
        <MediaPlayerPlay />
        <MediaPlayerSeek />
        <div className="flex items-center gap-2">
          <MediaPlayerTime />
          <MediaPlayerVolume />
          <MediaPlayerFullscreen />
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
}