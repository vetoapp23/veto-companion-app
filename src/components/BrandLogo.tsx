import { cn } from "@/lib/utils";

type Props = {
  /** Show wordmark next to the mark (default true). */
  withWordmark?: boolean;
  /** Mark size in px */
  size?: number;
  className?: string;
  imgClassName?: string;
  /** Extra classes on the wordmark span wrapper */
  wordmarkClassName?: string;
};

/** Official VetoCrm mark + optional wordmark. */
export function BrandLogo({
  withWordmark = true,
  size = 32,
  className,
  imgClassName,
  wordmarkClassName,
}: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-md object-cover", imgClassName)}
        decoding="async"
      />
      {withWordmark ? (
        <span className={cn("leading-none", wordmarkClassName)}>
          Veto<span>Crm</span>
        </span>
      ) : null}
    </span>
  );
}
