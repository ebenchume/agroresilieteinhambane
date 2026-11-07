import React, { useRef } from 'react';
import { useTextField, AriaTextFieldOptions } from 'react-aria';
import { AlertCircle } from 'lucide-react';

export interface AriaTextFieldProps {
  label: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  isRequired?: boolean;
  error?: string;
  errorMessage?: string;
  description?: string;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  disabled?: boolean;
  isDisabled?: boolean;
  autoComplete?: string;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  className?: string;
  maxLength?: number;
  autoFocus?: boolean;
}

export const AriaTextField: React.FC<AriaTextFieldProps> = (props) => {
  const {
    label,
    icon,
    endAdornment,
    error,
    errorMessage,
    description,
    className = '',
    onInputChange,
    onChange,
    required,
    isRequired,
    disabled,
    isDisabled,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const actualError = error || errorMessage;
  const isReq = required || isRequired;
  const isDis = disabled || isDisabled;

  const ariaOptions: AriaTextFieldOptions<'input'> = {
    label,
    isRequired: isReq,
    isDisabled: isDis,
    isInvalid: !!actualError,
    errorMessage: actualError,
    description,
    onChange: (val) => {
      if (onChange) onChange(val);
    },
    ...rest
  };

  const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
    ariaOptions,
    inputRef
  );

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          {...labelProps}
          className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
        >
          {label}
          {isReq && <span className="text-emerald-600 dark:text-emerald-400 ml-0.5">*</span>}
        </label>
      </div>

      <div className="relative rounded-xl">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          {...inputProps}
          onChange={(e) => {
            inputProps.onChange?.(e);
            onInputChange?.(e);
          }}
          className={`w-full py-2.5 rounded-xl border bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 dark:focus:border-emerald-500 ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${endAdornment ? 'pr-11' : 'pr-3.5'} ${
            actualError
              ? 'border-red-400 dark:border-red-600 focus:ring-red-400'
              : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
          } ${isDis ? 'opacity-60 cursor-not-allowed' : ''}`}
        />

        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>

      {description && !actualError && (
        <p {...descriptionProps} className="text-[11px] text-stone-500 dark:text-stone-400">
          {description}
        </p>
      )}

      {actualError && (
        <div {...errorMessageProps} className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-1 animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{actualError}</span>
        </div>
      )}
    </div>
  );
};
