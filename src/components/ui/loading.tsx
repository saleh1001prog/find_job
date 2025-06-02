"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave';
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const renderSpinner = () => (
    <motion.div
      className={cn(
        'border-4 border-gray-200 border-t-blue-500 rounded-full',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );

  const renderDots = () => (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'bg-blue-500 rounded-full',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={cn(
        'bg-blue-500 rounded-full',
        sizeClasses[size],
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity
      }}
    />
  );

  const renderSkeleton = () => (
    <div className={cn('space-y-3', className)}>
      <motion.div
        className="h-4 bg-gray-200 rounded-lg loading-shimmer"
        style={{ width: '75%' }}
      />
      <motion.div
        className="h-4 bg-gray-200 rounded-lg loading-shimmer"
        style={{ width: '50%' }}
      />
      <motion.div
        className="h-4 bg-gray-200 rounded-lg loading-shimmer"
        style={{ width: '60%' }}
      />
    </div>
  );

  const renderWave = () => (
    <div className={cn('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'bg-blue-500 rounded-t-sm',
            size === 'sm' ? 'w-1' : size === 'md' ? 'w-2' : size === 'lg' ? 'w-3' : 'w-4'
          )}
          animate={{
            height: [
              size === 'sm' ? 8 : size === 'md' ? 16 : size === 'lg' ? 24 : 32,
              size === 'sm' ? 16 : size === 'md' ? 32 : size === 'lg' ? 48 : 64,
              size === 'sm' ? 8 : size === 'md' ? 16 : size === 'lg' ? 24 : 32
            ]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      case 'wave':
        return renderWave();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderVariant()}
      {text && (
        <motion.p
          className="text-sm text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  variant?: LoadingProps['variant'];
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  variant = 'spinner'
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loading variant={variant} text={loadingText} size="lg" />
        </motion.div>
      )}
    </div>
  );
};

// Page Loading Component
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Loading page...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Loading variant="wave" size="xl" />
        <motion.h2
          className="mt-6 text-xl font-semibold text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.h2>
        <motion.div
          className="mt-4 w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>
    </div>
  );
};

export default Loading;
