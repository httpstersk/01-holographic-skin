/** @jsxImportSource react */

"use client";

import "@/styles/video/holo.css";
import {
  Container as ContainerPrimitive,
  Poster as PosterPrimitive,
  Slider as SliderPrimitive,
} from "@videojs/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/resolve-class-name";

import { VideoGestures } from "@/video/behaviors/gestures";
import { HoverSound } from "@/video/behaviors/hover-sound";
import { VideoHotkeys } from "@/video/behaviors/hotkeys";
import { VideoControls } from "@/video/controls";
import { feel } from "@/video/look";
import { AmbientHoloStage } from "@/video/holo/foil-layer";
import { ErrorDialog } from "@/video/shared/error-dialog";
import { Indicators } from "@/video/shared/indicators";
import { SeekIndicator } from "@/video/shared/seek-indicator";
import { StatusAnnouncer } from "@/video/shared/status-announcer";
import { Poster } from "@/video/shared/video-feedback";

/** Extends the player container with custom poster and thumbnail renderers. */
export interface VideoSkinProps extends Omit<
  ContainerPrimitive.Props,
  "children"
> {
  children?: ReactNode;
  renderPoster?: PosterPrimitive.ImageProps["render"];
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps["render"];
}

/** Composes the player surface, accessible controls, feedback, and decorative foil. */
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
        "outline-none",
        "bg-black",
        // System sans in sentence case, and room above the bar for captions.
        '[--media-font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"SF_Pro_Text",Inter,system-ui,sans-serif] [--media-caption-controls-y:calc(var(--media-spacing)*-22)]',
        className,
      )}
      data-preset="video"
      data-theme="holo"
      style={{ ...feel, ...style }}
      {...props}
    >
      {children}
      <Poster renderImage={renderPoster} />
      <ErrorDialog />
      <AmbientHoloStage />
      <VideoControls renderThumbnail={renderThumbnail} />

      <VideoHotkeys />
      <HoverSound />
      <VideoGestures />
      <StatusAnnouncer />
      <Indicators>
        <SeekIndicator />
      </Indicators>
    </ContainerPrimitive>
  );
}
