/** @jsxImportSource react */

import {
  audioText,
  backText,
  captionsText,
  qualityText,
  settingsText,
  speedText,
} from "@videojs/core/i18n/text/menu";
import { Menu, Text } from "@videojs/react";
import { AudioTrackRadioGroup } from "@videojs/react/ui/audio-track-radio-group";
import { CaptionsRadioGroup } from "@videojs/react/ui/captions-radio-group";
import { PlaybackRateRadioGroup } from "@videojs/react/ui/playback-rate-radio-group";
import { QualityRadioGroup } from "@videojs/react/ui/quality-radio-group";
import type { ClassValue } from "cn";
import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/resolve-class-name";
import { Button } from "@/video/shared/button";
import {
  CaptionsOffIcon,
  ChevronIcon,
  GearIcon,
  SpeechIcon,
  SpeedIcon,
  SwitchesIcon,
} from "@/video/shared/icons";
import { RadioItem } from "@/video/shared/menu-item";
import { ButtonTooltip } from "@/video/shared/tooltip";

const contentClass = cn(
  "absolute max-h-full overflow-auto overscroll-none outline-hidden",
  "[clip-path:inset(0)]",
  "flex flex-col gap-1! p-1.5 not-data-submenu:inset-x-0 not-data-submenu:top-0",
  "not-data-submenu:data-child-open:transform-[translateX(-100%)]",
  "not-data-submenu:data-child-open:rtl:transform-[translateX(100%)]",
  "not-data-submenu:data-child-open:[clip-path:inset(0_0_0_100%)] not-data-submenu:data-child-open:rtl:[clip-path:inset(0_100%_0_0)]",
  "data-submenu:inset-x-0 data-submenu:top-0 data-submenu:z-10",
);
const itemClass = cn(
  "flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-media-menu-item min-h-(--holo-menu-item-height) w-full shrink-0 bg-media-background bg-clip-padding px-2 py-0 text-start",
  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-current",
  "data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media",
);
const optionsClass = "flex flex-col gap-1";
const selectionClass = "max-w-24 truncate";
const triggerClass = cn(
  itemClass,
  "data-[availability=unavailable]:hidden data-[availability=unsupported]:hidden",
);

/** Translation entry for a settings submenu. */
type MenuLabel = typeof audioText | typeof captionsText | typeof qualityText | typeof speedText;

/** Options accepted by the player settings trigger. */
interface SettingsMenuProps {
  align?: Menu.RootProps["align"];
  buttonClassName?: ClassValue;
  iconClassName?: ClassValue;
  side?: Menu.RootProps["side"];
}

/** Option-group parts supplied by Video.js for a single setting. */
interface OptionGroup {
  Options: ComponentType<{ className: string; renderItem: typeof renderOption }>;
  Root: ComponentType<{ children?: ReactNode }>;
  Value: ComponentType<{ className: string }>;
}

/** Display metadata shared by all playback options. */
interface SettingOption {
  badge?: string | undefined;
  label: string;
  tier?: string | undefined;
}

/** The localized group, glyph, and option renderer for a submenu. */
interface SubmenuProps {
  group: OptionGroup;
  icon: ComponentType<{ className: string }>;
  label: MenuLabel;
}

const settings = [
  { group: QualityRadioGroup, icon: SwitchesIcon, label: qualityText },
  { group: AudioTrackRadioGroup, icon: SpeechIcon, label: audioText },
  { group: PlaybackRateRadioGroup, icon: SpeedIcon, label: speedText },
  { group: CaptionsRadioGroup, icon: CaptionsOffIcon, label: captionsText },
] satisfies readonly SubmenuProps[];

/** Renders the submenu and its first item, which Video.js uses to return to the parent. */
function Content({ children, label }: { children: ReactNode; label: MenuLabel }) {
  return (
    <Menu.Content className={contentClass}>
      <Menu.Item className={itemClass}>
        <MenuChevron back />
        <Text className="sr-only" token={backText.key}>{backText.text}</Text>
        <Text token={label.key}>{label.text}</Text>
      </Menu.Item>
      <Menu.Separator className="hidden" />
      {children}
    </Menu.Content>
  );
}

/** Indicates the submenu direction in both left-to-right and right-to-left layouts. */
function MenuChevron({ back = false }: { back?: boolean }) {
  const direction = back ? "rotate-180 rtl:rotate-0" : "rtl:scale-x-[-1]";
  return <ChevronIcon className={cn("size-4 shrink-0 opacity-70", direction)} />;
}

/** Renders an option and preserves the interaction props supplied by Video.js. */
function renderOption(props: Menu.RadioItemProps, { badge, label, tier }: SettingOption) {
  return (
    <RadioItem {...props}>
      <span>
        {label}
        {tier && <sup className="ps-0.5 pt-px text-media-sm leading-none opacity-70">{tier}</sup>}
      </span>
      {badge && <span className="rounded-media-pill bg-media-muted px-1.5 text-media-sm">{badge}</span>}
    </RadioItem>
  );
}

/** Keeps the trigger and content inside the same Video.js option group. */
function Root({ children, group: Group }: {
  children: ReactNode;
  group: OptionGroup["Root"];
}) {
  return (
    <Menu.Root>
      <Group>{children}</Group>
    </Menu.Root>
  );
}

/** Opens the localized playback settings in visual and keyboard navigation order. */
export function SettingsMenu({
  align = "center",
  buttonClassName,
  iconClassName,
  side = "top",
}: SettingsMenuProps = {}) {
  return (
    <Menu.Root align={align} side={side}>
      <ButtonTooltip label={<Text token={settingsText.key}>{settingsText.text}</Text>}>
        <Menu.Trigger className={cn("group/settings", buttonClassName)} render={<Button />}>
          <GearIcon
            className={cn(
              "col-start-1 row-start-1 size-4.5 motion-safe:transition-transform duration-media-base ease-out motion-safe:group-hover/settings:rotate-45",
              iconClassName,
            )}
          />
          <Text className="sr-only" token={settingsText.key}>{settingsText.text}</Text>
        </Menu.Trigger>
      </ButtonTooltip>
      <Menu.Popup
        className={cn(
          'm-0 overflow-visible border-0 text-inherit',
          'media-transitioning:opacity-0 media-transitioning:blur-media-hidden-popup media-transitioning:scale-media-hidden-popup',
          'data-starting-style:transform-[translate(var(--media-popup-translate-x-distance,0),var(--media-popup-translate-y-distance,0))]',
          'data-ending-style:transform-none',
          'data-[side=top]:origin-bottom data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left',
          'data-[side=top]:[--media-popup-translate-y-distance:var(--media-popup-translate-distance)]',
          'data-[side=bottom]:[--media-popup-translate-y-distance:calc(var(--media-popup-translate-distance)*-1)]',
          'data-[side=left]:[--media-popup-translate-x-distance:var(--media-popup-translate-distance)]',
          'data-[side=right]:[--media-popup-translate-x-distance:calc(var(--media-popup-translate-distance)*-1)]',
          'before:pointer-events-auto before:absolute',
          'data-[side=top]:before:inset-x-0 data-[side=top]:before:top-full',
          'data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:bottom-full',
          'data-[side=left]:before:inset-y-0 data-[side=left]:before:left-full',
          'data-[side=right]:before:inset-y-0 data-[side=right]:before:right-full',
          'data-[side=top]:before:h-(--media-popup-side-offset) data-[side=bottom]:before:h-(--media-popup-side-offset)',
          'data-[side=left]:before:w-(--media-popup-side-offset) data-[side=right]:before:w-(--media-popup-side-offset)',
          'z-20 m-0 min-w-48 max-w-(--media-menu-available-width) overflow-hidden! rounded-media-popup card-media p-0 text-media-popover-foreground transition-media-menu-resize',
          '[--media-popup-side-offset:var(--media-popover-side-offset)] [--media-popover-side-offset:calc(var(--media-spacing)*4)]',
          'max-h-[min(var(--media-menu-available-height,--spacing(56)),--spacing(56))] overscroll-none',
          'h-(--media-menu-height) w-(--media-menu-width)',
          'motion-reduce:transition-none',
          'media-high-contrast:outline forced-colors:outline'
        )}
        keepMounted
      >
        <Menu.Content className={contentClass}>
          {settings.map((setting) => (
            <SettingsSubmenu key={setting.label.key} {...setting} />
          ))}
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}

/** Composes the menu controls with the native option group's state and selection. */
function SettingsSubmenu({ group: { Options, Root, Value }, icon, label }: SubmenuProps) {
  return (
    <Submenu.Root group={Root}>
      <Submenu.Trigger icon={icon} label={label}>
        <Value className={selectionClass} />
      </Submenu.Trigger>
      <Submenu.Content label={label}>
        <Options className={optionsClass} renderItem={renderOption} />
      </Submenu.Content>
    </Submenu.Root>
  );
}

/** Opens a submenu and shows the current selection. */
function Trigger({
  children,
  icon: Icon,
  label,
}: {
  children: ReactNode;
  icon: ComponentType<{ className: string }>;
  label: MenuLabel;
}) {
  return (
    <Menu.Trigger className={triggerClass}>
      <Icon className="size-4.5 shrink-0 opacity-70" />
      <Text token={label.key}>{label.text}</Text>
      <span className="ms-auto inline-flex min-w-0 items-center gap-1 ps-2 opacity-70">
        {children}
        <MenuChevron />
      </span>
    </Menu.Trigger>
  );
}

/** Shared parts for the four playback settings submenus. */
const Submenu = { Content, Root, Trigger };
