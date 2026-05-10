import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { navigateTo } from "./hardNavigation";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
};

export function Link({ to, children, ...props }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    props.onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
    if (props.target && props.target !== "_self") return;
    if (props.download) return;
    if (/^(https?:)?\/\//.test(to) || to.startsWith("mailto:") || to.startsWith("tel:")) return;
    event.preventDefault();
    navigateTo(to);
  }

  return (
    <a href={to} {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
