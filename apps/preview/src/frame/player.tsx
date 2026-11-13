import { MuxVideo } from "@videojs/react/media/mux-video";
import { VideoPlayer } from "@videojs/react/video";

import { VideoSkin } from "@/video/skin";

import type { PlaybackProps } from "../shell/params";

// What the preview plays. Change these to try the skin with your own media; any Mux or HLS URL works.
const SRC =
  "https://stream.mux.com/ha8tOsC3R3GUhQNDzcvJ2Yvn7vrSar00OufthXbux9ZY.m3u8";
const POSTER =
  "https://image.mux.com/ha8tOsC3R3GUhQNDzcvJ2Yvn7vrSar00OufthXbux9ZY/thumbnail.webp?time=10";

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({
  dir,
  media,
}: {
  dir?: "ltr" | "rtl";
  media?: PlaybackProps;
}) {
  return (
    <VideoPlayer poster={POSTER}>
      <VideoSkin dir={dir}>
        <MuxVideo {...media} src={SRC} playsInline crossOrigin="">
          <track kind="chapters" label="English" srcLang="en" default />
        </MuxVideo>
      </VideoSkin>
    </VideoPlayer>
  );
}
