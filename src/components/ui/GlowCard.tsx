import { cn } from "@/lib/cn";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
  padding?: boolean;
  style?: React.CSSProperties;
}

export default function GlowCard({
  children, className, as: Tag = "div", padding = true, style,
}: GlowCardProps) {
  return (
    <Tag className={cn("glow-card", padding && "p-5", className)} style={style}>
      {children}
    </Tag>
  );
}
