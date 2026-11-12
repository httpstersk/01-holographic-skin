/** @jsxImportSource react */

"use client";

import "../styles/video/holo.css";
import {
  Container as ContainerPrimitive,
  Poster as PosterPrimitive,
  Slider as SliderPrimitive,
} from "@videojs/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/resolve-class-name";

import { VideoGestures } from "./behaviors/gestures";
import { VideoHotkeys } from "./behaviors/hotkeys";
import { VideoControls } from "./controls";
import { feel } from "./look";
import { AmbientHoloStage } from "./holo/foil-layer";
import { ErrorDialog } from "./shared/error-dialog";
import { Indicators } from "./shared/indicators";
import { SeekIndicator } from "./shared/seek-indicator";
import { StatusAnnouncer } from "./shared/status-announcer";
import { Poster } from "./shared/video-feedback";

export interface VideoSkinProps extends Omit<
  ContainerPrimitive.Props,
  "children"
> {
  children?: ReactNode;
  renderPoster?: PosterPrimitive.ImageProps["render"];
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps["render"];
}

export function VideoSkin({
  children,
  className,
  renderPoster,
  renderThumbnail,
  style,
  ...props
}: VideoSkinProps = {}) {
  return (
    <ContainerPrimitive
      className={cn(
        "media-skin",
        "relative block h-full w-full overflow-hidden rounded-media-player [--spacing:var(--media-spacing)] [font-family:var(--media-font-family,var(--media-holo-font))] text-media tracking-normal normal-case text-media-foreground @container/media-root",
        "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-media-ring",
        "bg-black",
        // System sans in sentence case, and room above the bar for captions.
        '[--media-font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"SF_Pro_Text",Inter,system-ui,sans-serif] [--media-caption-controls-y:calc(var(--media-spacing)*-22)]',
        className,
      )}
      data-theme="holo"
      style={{ ...feel, ...style }}
      data-preset="video"
      {...props}
    >
      {children}
      <Poster renderImage={renderPoster} />
      <ErrorDialog />
      <AmbientHoloStage />
      <VideoControls renderThumbnail={renderThumbnail} />

      <VideoHotkeys />
      <VideoGestures />
      <StatusAnnouncer />
      <Indicators>
        <SeekIndicator />
      </Indicators>
    </ContainerPrimitive>
  );
}
