'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> & { showCloseButton?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-backdrop"
        className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
      />
      <DialogPrimitive.Viewport className="fixed inset-0 z-[101] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={[
            'relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[var(--site-line)] bg-[var(--site-band)] text-[var(--site-fg)] shadow-2xl outline-none transition duration-200 data-[ending-style]:translate-y-3 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-3 data-[starting-style]:opacity-0 sm:rounded-2xl sm:data-[ending-style]:translate-y-0 sm:data-[ending-style]:scale-95 sm:data-[starting-style]:translate-y-0 sm:data-[starting-style]:scale-95',
            typeof className === 'string' ? className : '',
          ].join(' ')}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              className="absolute top-4 right-4 rounded-md px-2 py-1 text-sm text-[var(--site-muted)] transition hover:bg-[var(--site-band-alt)] hover:text-[var(--site-fg)]"
              aria-label="Close"
            >
              Close
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={[
        'flex flex-col gap-1.5 border-b border-[var(--site-line)] px-6 py-5 pr-16',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={[
        'font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight',
        typeof className === 'string' ? className : '',
      ].join(' ')}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={[
        'text-sm text-[var(--site-muted)]',
        typeof className === 'string' ? className : '',
      ].join(' ')}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
