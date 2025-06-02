"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated' | 'bordered';
  hover?: 'lift' | 'glow' | 'scale' | 'none';
  animation?: 'fade-in' | 'slide-up' | 'scale-in' | 'none';
  delay?: number;
  onClick?: () => void;
  disabled?: boolean;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = 'lift',
  animation = 'fade-in',
  delay = 0,
  onClick,
  disabled = false
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300 ease-out';
  
  const variantClasses = {
    default: 'bg-white shadow-lg border border-gray-100',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100',
    glass: 'glass-morphism shadow-xl',
    elevated: 'bg-white shadow-xl border border-gray-200',
    bordered: 'bg-white border-2 border-gray-200 shadow-md'
  };

  const hoverClasses = {
    lift: 'hover:shadow-xl hover:-translate-y-2 hover:border-gray-200',
    glow: 'hover:shadow-2xl hover:shadow-blue-500/20',
    scale: 'hover:scale-105 hover:shadow-lg',
    none: ''
  };

  const animationVariants = {
    'fade-in': {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay }
    },
    'slide-up': {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay }
    },
    'scale-in': {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, delay }
    },
    'none': {}
  };

  const cardClasses = cn(
    baseClasses,
    variantClasses[variant],
    hoverClasses[hover],
    onClick && !disabled && 'cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const CardComponent = animation !== 'none' ? motion.div : 'div';
  const animationProps = animation !== 'none' ? animationVariants[animation] : {};

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick && !disabled ? onClick : undefined}
      {...animationProps}
    >
      {children}
    </CardComponent>
  );
};

// Card Header Component
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className,
  gradient = false 
}) => {
  return (
    <div className={cn(
      'p-6 border-b border-gray-100',
      gradient && 'bg-gradient-to-r from-blue-50 to-indigo-50',
      className
    )}>
      {children}
    </div>
  );
};

// Card Content Component
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-t border-gray-100 bg-gray-50/50', className)}>
      {children}
    </div>
  );
};

// Job Card Component (Specialized for job listings)
interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  logo?: string;
  tags?: string[];
  onApply?: () => void;
  onSave?: () => void;
  className?: string;
  index?: number;
}

export const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  location,
  salary,
  type,
  logo,
  tags = [],
  onApply,
  onSave,
  className,
  index = 0
}) => {
  return (
    <EnhancedCard
      variant="gradient"
      hover="lift"
      animation="slide-up"
      delay={index * 0.1}
      className={cn('overflow-hidden', className)}
    >
      <CardContent className="p-0">
        {/* Header with logo and company */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {logo && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={logo} alt={company} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{title}</h3>
                <p className="text-gray-600 text-sm">{company}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSave}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Job details */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {type}
            </span>
          </div>

          {salary && (
            <p className="text-lg font-semibold text-green-600 mb-3">{salary}</p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer with apply button */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onApply}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Apply Now
          </motion.button>
        </div>
      </CardContent>
    </EnhancedCard>
  );
};

export default EnhancedCard;
