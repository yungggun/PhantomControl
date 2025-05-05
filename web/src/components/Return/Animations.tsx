"use client";

import { motion } from "framer-motion";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export const renderConfetti = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1 }}
    className="fixed inset-0 pointer-events-none z-0"
  >
    {Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 15 + 5;
      const color = [
        "bg-primary-300",
        "bg-success-300",
        "bg-primary-200",
        "bg-success-200",
      ][Math.floor(Math.random() * 4)];

      return (
        <motion.div
          key={i}
          className={`absolute rounded-md ${color}`}
          style={{
            width: size,
            height: size * (Math.random() * 0.8 + 0.2),
            top: "-5%",
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            top: "105%",
            rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
            x: Math.random() * 100 - 50,
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
            ease: [0.1, 0.4, 0.8, 1],
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: Math.random() * 5,
          }}
        />
      );
    })}
  </motion.div>
);
