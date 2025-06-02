// Enhanced UI Components Export Index
// This file provides centralized exports for all enhanced UI components

// Animation Components
export { default as PageTransition } from './page-transition';
export { default as StaggerContainer, StaggerItem } from './stagger-container';
export { default as ScrollReveal } from './scroll-reveal';

// Micro Interactions
export {
  AnimatedButton,
  FloatingActionButton,
  PulseIndicator,
  AnimatedCounter,
  AnimatedProgressBar
} from './micro-interactions';

// Enhanced Notifications
export {
  EnhancedNotification,
  NotificationContainer,
  NotificationBadge,
  useNotifications
} from './enhanced-notifications';

// Performance Components
export { default as LazyImage } from './lazy-image';

// Enhanced Forms
export {
  EnhancedFormField,
  FormProgress,
  validationRules
} from './enhanced-form';

// File Upload (commented out - can be enabled when needed)
// export { default as EnhancedFileUpload } from './enhanced-file-upload';

// Accessibility Helpers
export {
  SkipToMain,
  FocusTrap,
  KeyboardNavigation,
  AccessibleButton,
  AccessibleModal,
  useScreenReader,
  useHighContrast,
  useReducedMotion
} from './accessibility-helpers';

// Type definitions for better TypeScript support
export type NotificationProps = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type NotificationPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-center' 
  | 'bottom-center';

// Utility functions
export const createNotificationId = () => Math.random().toString(36).substr(2, 9);

export const getAnimationPreference = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getContrastPreference = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Default configurations
export const defaultAnimationConfig = {
  duration: 0.3,
  ease: 'easeOut',
  staggerDelay: 0.1
};

export const defaultNotificationConfig = {
  duration: 5000,
  position: 'top-right' as NotificationPosition
};

export const defaultFormConfig = {
  autoSave: false,
  autoSaveDelay: 1000,
  validateOnChange: true
};
