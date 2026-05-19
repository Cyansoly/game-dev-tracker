"use client";

import { motion } from "framer-motion";

interface AnimatedPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedPageWrapper({
  children,
  className,
}: AnimatedPageWrapperProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
