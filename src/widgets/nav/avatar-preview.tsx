import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Github } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { content } from "@/content/data";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";

const linkProps = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Header avatar badge that expands into a mini profile card anchored top-left. */
export function AvatarPreview() {
  const { profile } = content;
  const reduce = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const handle = `@${profile.links.github.replace(/\/$/, "").split("/").pop()}`;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        data-avatar-frame
        aria-label="View profile photo"
        className="relative grid size-8 cursor-zoom-in place-items-center overflow-hidden rounded-md border border-primary/50 font-mono text-xs text-primary shadow-glow transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {profile.monogram}
        {profile.avatarUrl && (
          <img
            data-avatar
            src={profile.avatarUrl}
            alt=""
            width={32}
            height={32}
            className="absolute inset-0 size-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content asChild aria-describedby={undefined}>
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.15, x: -12, y: -12 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{ transformOrigin: "top left" }}
            className="fixed top-4 left-4 z-[70] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-primary/30 bg-card/90 shadow-glow backdrop-blur-xl focus:outline-none md:left-[max(1rem,calc((100vw-72rem)/2+4rem))]"
          >
            <div className="relative">
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={288}
                  height={288}
                  className="aspect-square w-full object-cover"
                />
              )}
              <a
                href={profile.links.github}
                {...linkProps}
                aria-label="Open GitHub profile in a new tab"
                className="absolute top-3 right-3 grid size-9 place-items-center rounded-full border border-primary/40 bg-background/80 text-primary shadow-halo backdrop-blur-md transition hover:scale-110 hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Github
                  aria-hidden
                  className="size-[18px] drop-shadow-[0_0_8px_var(--color-primary)]"
                />
              </a>
            </div>
            <div className="space-y-1 p-4">
              <DialogPrimitive.Title className="font-semibold text-foreground">
                {profile.name}
              </DialogPrimitive.Title>
              <p className="font-mono text-xs text-primary">{handle}</p>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
