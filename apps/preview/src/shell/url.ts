/**
 * Browsers limit `history.replaceState` to about 100 calls per 10 seconds and throw past it, which dragging a slider
 * reaches quickly. Callers update the page straight away and pass the URL here; only the latest one is written, once
 * changes pause, and any pending one is written before the page is hidden so a reload still sees it.
 */
export function createUrlWriter(delay = 250): (url: string) => void {
  let pending: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const flush = () => {
    clearTimeout(timer);
    timer = undefined;

    const url = pending;
    pending = undefined;
    if (url === undefined || new URL(url, location.href).href === location.href) return;

    try {
      history.replaceState(history.state, '', url);
    } catch (error) {
      // A browser can still reject a write after a burst of changes or during page teardown.
      if (!(error instanceof DOMException && error.name === 'SecurityError')) throw error;
    }
  };

  window.addEventListener('pagehide', flush);

  return (url) => {
    pending = url;
    clearTimeout(timer);
    timer = setTimeout(flush, delay);
  };
}
