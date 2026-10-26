/** SSR already restores the document before hydration; never repeat it late. */
export function createScrollRestorationPolicy() {
  let hydrated = false;
  return (isServer: boolean) => {
    if (isServer) return true;
    if (!hydrated) {
      hydrated = true;
      return false;
    }
    return true;
  };
}