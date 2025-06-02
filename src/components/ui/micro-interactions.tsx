"use client";

import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: "text-blue-600 hover:bg-blue-50"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        ${baseClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { 
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      {/* Ripple effect */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
      
      <motion.span
        className={loading ? "opacity-0" : "opacity-100"}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

interface FloatingActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  children,
  onClick,
  className = "",
  position = 'bottom-right'
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <motion.button
      className={`
        fixed z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 
        text-white rounded-full shadow-lg flex items-center justify-center
        ${positionClasses[position]}
        ${className}
      `}
      onClick={onClick}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 15px 30px rgba(59, 130, 246, 0.4)"
      }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5
      }}
    >
      {children}
    </motion.button>
  );
};

interface PulseIndicatorProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  className = "",
  color = "bg-green-500",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} ${color} rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={`absolute inset-0 ${sizeClasses[size]} ${color} rounded-full opacity-30`}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({
  from,
  to,
  duration = 2,
  className = "",
  suffix = "",
  prefix = ""
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {prefix}
        <motion.span
          initial={{ textContent: from }}
          animate={{ textContent: to }}
          transition={{ duration, ease: "easeOut" }}
        />
        {suffix}
      </motion.span>
    </motion.span>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  color?: string;
  height?: string;
  animated?: boolean;
}

export const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
  color = "bg-blue-500",
  height = "h-2",
  animated = true
}) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height} ${className}`}>
      <motion.div
        className={`${height} ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ 
          duration: animated ? 1.5 : 0,
          ease: "easeOut"
        }}
      />
    </div>
  );
};
