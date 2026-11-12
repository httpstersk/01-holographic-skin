/** @jsxImportSource react */

import { Hotkey } from '@videojs/react';

import { PlaybackHotkeys } from '@/video/behaviors/playback-hotkeys';

/** Allows consumers to disable playback and display shortcuts together. */
export interface VideoHotkeysProps {
  disabled?: boolean | undefined;
}

/** Registers playback, captions, fullscreen, and picture-in-picture shortcuts on the player. */
export function VideoHotkeys({ disabled = false }: VideoHotkeysProps = {}) {
  return (
    <>
      <PlaybackHotkeys disabled={disabled} />
      <Hotkey action="toggleFullscreen" disabled={disabled} keys="f" />
      <Hotkey action="toggleSubtitles" disabled={disabled} keys="c" />
      <Hotkey action="togglePictureInPicture" disabled={disabled} keys="i" />
    </>
  );
}
