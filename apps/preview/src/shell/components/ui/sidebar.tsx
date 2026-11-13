// Adapted from the Video.js sandbox for the workbench's options panel.
import { Sheet, SheetContent, SheetDescription, SheetHeader } from '@preview/shell/components/ui/sheet';
import { useBreakpoint } from '@preview/shell/hooks/use-breakpoint';
import { cn } from 'cn';
import { createContext, type ComponentProps, type CSSProperties, useContext, useMemo, useState } from 'react';

const SIDEBAR_MOBILE_BREAKPOINT = 768;
const SIDEBAR_WIDTH = '20rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider.');
  return context;
}

export function SidebarProvider({
  open,
  onOpenChange: setOpen,
  className,
  children,
}: Pick<ComponentProps<'div'>, 'className' | 'children'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useBreakpoint(SIDEBAR_MOBILE_BREAKPOINT);
  const [openMobile, setOpenMobile] = useState(false);
  const context = useMemo<SidebarContextValue>(
    () => ({
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar() {
        if (isMobile) setOpenMobile((current) => !current);
        else setOpen(!open);
      },
    }),
    [isMobile, open, openMobile, setOpen]
  );

  return (
    <SidebarContext.Provider value={context}>
      <div
        data-slot="sidebar-wrapper"
        style={{ '--sidebar-width': SIDEBAR_WIDTH } as CSSProperties}
        className={cn('flex min-h-svh w-full', className)}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ id, className, children, ...props }: ComponentProps<'aside'> & { id: string }) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          id={id}
          showCloseButton={false}
          finalFocus={() => document.getElementById(`${id}-trigger`)}
          data-slot="sidebar"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0"
          style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as CSSProperties}
          side="right"
        >
          <SheetHeader className="sr-only">
            <SheetDescription>Preview and playback settings.</SheetDescription>
          </SheetHeader>
          <div className="flex size-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="text-sidebar-foreground hidden md:block" data-slot="sidebar">
      <div
        data-slot="sidebar-gap"
        className={cn(
          'transition-[width] duration-200 ease-linear motion-reduce:transition-none',
          open ? 'w-(--sidebar-width)' : 'w-0'
        )}
      />
      <aside
        id={id}
        data-slot="sidebar-container"
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 right-0 z-10 hidden h-svh w-(--sidebar-width) border-l transition-transform duration-200 ease-linear motion-reduce:transition-none md:flex',
          !open && 'translate-x-full',
          className
        )}
        {...props}
      >
        <div data-slot="sidebar-inner" className="bg-sidebar flex size-full flex-col">
          {open ? children : null}
        </div>
      </aside>
    </div>
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn('no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto', className)}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  );
}
