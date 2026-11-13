/** @jsxImportSource react */

import { Title } from "@videojs/react";

/**
 * The content title from the media's own metadata, on a black foil-lit plate like the other controls. Video.js renders
 * nothing until a title resolves. Display comes from `holo.css`, which hides it in short embeds; a utility class would win over that rule. It takes no pointer input, so a click on it still reaches the picture.
 */
export function VideoTitle() {
  return (
    <Title
      className="pointer-events-none h-(--holo-utility-size) min-w-0 max-w-full items-center rounded-full bg-media-background px-4 text-media-foreground font-semibold leading-none tracking-normal forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:forced-color-adjust-none media-high-contrast:border media-high-contrast:border-solid media-high-contrast:border-current"
      data-holo=""
      data-holo-title=""
    />
  );
}
