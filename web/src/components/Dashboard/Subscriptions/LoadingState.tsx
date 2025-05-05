import { Spinner } from "@heroui/react";
import { motion } from "framer-motion";

const LoadingState = () => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Spinner size="lg" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 text-primary font-medium"
        >
          Your subscription data is loaded...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingState;
