import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, FileDown, Moon, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  type ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { content } from "@/content/data";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";
import { dockBar, dockItem } from "@/shared/ui/dock";
import { readResumeDark, writeResumeDark } from "./resume-theme";
import { saveResume } from "./save-resume";
import "./resume-viewer.css";

const dockButton = dockItem({ tone: "fixed" });

/**
 * In-app resume viewer. Opens the PDF in a full-screen dialog so installed-PWA
 * users never get trapped in a browserless document view. The floating controls
 * use fixed dark values on purpose: they float over the paper-white PDF and must
 * stay readable regardless of the site theme.
 */
export function ResumeViewer({
  children,
  triggerClassName,
  open: controlledOpen,
  onOpenChange,
}: {
  /** Trigger content. Omit to control the viewer externally with no trigger. */
  children?: ReactNode;
  triggerClassName?: string | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { profile } = content;
  const reduce = usePrefersReducedMotion();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [darkView, setDarkViewState] = useState(false);
  // Every viewer instance re-reads the saved mode when it opens, so all triggers agree.
  useEffect(() => {
    if (open) setDarkViewState(readResumeDark());
  }, [open]);
  const setDarkView = (update: (v: boolean) => boolean) =>
    setDarkViewState((v) => {
      const next = update(v);
      writeResumeDark(next);
      return next;
    });
  const [page, setPage] = useState(1);
  const zoomRef = useRef<ReactZoomPanPinchContentRef>(null);
  const pagesRef = useRef<HTMLDivElement>(null);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {children != null && (
        <DialogPrimitive.Trigger className={triggerClassName}>{children}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content asChild aria-describedby={undefined}>
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-2 z-[90] flex flex-col overflow-hidden rounded-2xl border border-[#62F4E0]/25 bg-[#080A0F] shadow-2xl focus:outline-none md:inset-6"
          >
            <DialogPrimitive.Title className="sr-only">
              Resume — {profile.name}
            </DialogPrimitive.Title>
            <div className="relative min-h-0 flex-1" data-resume-vignette>
              <iframe
                title={`${profile.name} — Resume`}
                src={profile.resumeUrl}
                className={cn(
                  "hidden size-full bg-white md:block",
                  darkView && "resume-frame--dark",
                )}
              />
              <div data-resume-reader className="absolute inset-0 md:hidden">
                <TransformWrapper
                  ref={zoomRef}
                  minScale={1}
                  maxScale={4}
                  initialScale={1}
                  limitToBounds
                  doubleClick={{ mode: "toggle", step: 0.8 }}
                  wheel={{ step: 0.1 }}
                  onTransform={(_ref, s) => {
                    const h = pagesRef.current?.offsetHeight ?? 0;
                    if (h) setPage(-s.positionY / s.scale > h / 2 - 200 ? 2 : 1);
                  }}
                >
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%", touchAction: "none" }}
                    contentStyle={{ width: "100%" }}
                  >
                    <div
                      ref={pagesRef}
                      className={cn(
                        "flex w-full flex-col gap-3 bg-[#080A0F] p-3 pb-28",
                        darkView && "resume-frame--dark",
                      )}
                    >
                      {[1, 2].map((n) => (
                        <img
                          key={n}
                          src={`/resume/page-${n}.webp`}
                          alt={`Resume page ${n} of 2`}
                          width={1818}
                          height={2573}
                          draggable={false}
                          className="h-auto w-full select-none rounded-sm bg-white shadow-lg"
                        />
                      ))}
                    </div>
                  </TransformComponent>
                </TransformWrapper>
                <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-[#080A0F]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#9299AA]">
                  Page {page} of 2
                </span>
              </div>
            </div>
            <nav
              aria-label="Resume controls"
              data-resume-dock
              className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            >
              <div className={dockBar({ tone: "fixed" })}>
                <DialogPrimitive.Close aria-label="Back to portfolio" className={dockButton}>
                  <ArrowLeft aria-hidden className="size-5 text-[#62F4E0]" />
                  <span>Back</span>
                </DialogPrimitive.Close>
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => zoomRef.current?.zoomOut(0.5)}
                  className={cn(dockButton, "md:hidden")}
                >
                  <ZoomOut aria-hidden className="size-5 text-[#62F4E0]" />
                  <span>Out</span>
                </button>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => zoomRef.current?.zoomIn(0.5)}
                  className={cn(dockButton, "md:hidden")}
                >
                  <ZoomIn aria-hidden className="size-5 text-[#62F4E0]" />
                  <span>In</span>
                </button>
                <button
                  type="button"
                  aria-label={darkView ? "Paper view" : "Dark view"}
                  aria-pressed={darkView}
                  onClick={() => setDarkView((v) => !v)}
                  className={dockButton}
                >
                  {darkView ? (
                    <Sun aria-hidden className="size-5 text-[#62F4E0]" />
                  ) : (
                    <Moon aria-hidden className="size-5 text-[#62F4E0]" />
                  )}
                  <span>{darkView ? "Paper" : "Dark"}</span>
                </button>
                <a
                  href={profile.resumeUrl}
                  download={profile.resumeFileName}
                  aria-label="Download PDF"
                  onClick={(e) => {
                    e.preventDefault();
                    void saveResume(profile.resumeUrl, profile.resumeFileName).catch(() => {
                      window.open(profile.resumeUrl, "_blank", "noopener,noreferrer");
                    });
                  }}
                  className={dockButton}
                >
                  <FileDown aria-hidden className="size-5 text-[#62F4E0]" />
                  <span>Save</span>
                </a>
              </div>
            </nav>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
