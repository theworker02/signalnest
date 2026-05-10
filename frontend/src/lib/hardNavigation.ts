export const SIGNALNEST_NAVIGATION_EVENT = "signalnest:navigate";

export function navigateTo(to: string) {
  if (window.location.pathname === to) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new Event(SIGNALNEST_NAVIGATION_EVENT));
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

export function useHardNavigate() {
  return (to: string) => {
    navigateTo(to);
  };
}

export function currentPathname() {
  return window.location.pathname.replace(/\/$/, "") || "/";
}
