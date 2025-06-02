"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, ReactNode } from 'react';
import { FiCheck, FiX, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  validation?: (value: string) => string | null;
  icon?: ReactNode;
  helpText?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const EnhancedFormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  validation,
  icon,
  helpText,
  autoSave = false,
  autoSaveDelay = 1000
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !value) return;

    const timer = setTimeout(() => {
      // Here you would typically save to localStorage or send to server
      console.log(`Auto-saving ${name}:`, value);
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [value, autoSave, autoSaveDelay, name]);

  // Validation
  useEffect(() => {
    if (validation && value) {
      const validationError = validation(value);
      setLocalError(validationError);
      setIsValid(!validationError);
    } else if (value) {
      setIsValid(true);
      setLocalError(null);
    } else {
      setIsValid(null);
      setLocalError(null);
    }
  }, [value, validation]);

  const displayError = error || localError;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Label */}
      <motion.label
        htmlFor={name}
        className={`block text-sm font-medium transition-colors ${
          isFocused ? 'text-blue-600' : 'text-gray-700'
        }`}
        animate={{ color: isFocused ? '#2563eb' : '#374151' }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input field */}
        <motion.input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-12' : isValid !== null ? 'pr-10' : ''}
            ${displayError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : isFocused 
                ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2
          `}
          animate={{
            borderColor: displayError 
              ? '#ef4444' 
              : isFocused 
                ? '#3b82f6' 
                : '#d1d5db'
          }}
        />

        {/* Password toggle */}
        {type === 'password' && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </motion.button>
        )}

        {/* Validation indicator */}
        {isValid !== null && type !== 'password' && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {isValid ? (
              <FiCheck className="w-5 h-5 text-green-500" />
            ) : (
              <FiX className="w-5 h-5 text-red-500" />
            )}
          </motion.div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-600 text-sm"
          >
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text */}
      {helpText && !displayError && (
        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {helpText}
        </motion.p>
      )}

      {/* Auto-save indicator */}
      {autoSave && value && (
        <motion.div
          className="flex items-center gap-1 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>Auto-saved</span>
        </motion.div>
      )}
    </motion.div>
  );
};

interface FormProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  steps,
  currentStep,
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <motion.div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {index < currentStep ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FiCheck className="w-4 h-4" />
                </motion.div>
              ) : (
                index + 1
              )}
            </motion.div>

            {/* Step label */}
            <motion.span
              className={`ml-2 text-sm ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.1 }}
            >
              {step}
            </motion.span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <motion.div
                className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Common validation functions
export const validationRules = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },
  
  password: (value: string) => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    return null;
  },
  
  phone: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/\s/g, '')) ? null : 'Please enter a valid phone number';
  },
  
  required: (value: string) => {
    return value.trim() ? null : 'This field is required';
  }
};
