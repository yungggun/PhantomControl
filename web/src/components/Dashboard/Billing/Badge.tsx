import clsx from "clsx";
import { FC } from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

const Badge: FC<BadgeProps> = ({
  className,
  variant = "default",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variantClasses = {
    default:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
    success:
      "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
    warning:
      "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200",
  };

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      {...props}
    ></div>
  );
};

export default Badge;
