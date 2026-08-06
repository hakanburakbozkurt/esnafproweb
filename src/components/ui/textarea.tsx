import type { TextareaHTMLAttributes } from "react";
import { cn, inputClassName } from "@/lib/utils/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputClassName, "min-h-[120px] resize-y", className)}
      {...props}
    />
  );
}
