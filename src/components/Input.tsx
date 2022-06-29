import React from 'react';
import classNames from 'classnames';

/**
 * The properties for an `Input`.
 */
export interface InputProps {
  /**
   * The type of the input.
   * @default 'text'
   */
  type?: 'text';

  /**
   * The id for the HTML element.
   * Should be defined when a label is given.
   * @default undefined
   */
  id?: string;

  /**
   * A label to show for the input.
   * Needs `id` to be set.
   * @default undefined
   */
  label?: string;

  /**
   * A placeholder text to show in the input.
   * @default undefined
   */
  placeholder?: string;

  /**
   * Whether the input should be in full width.
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether the input should be in a disabled state.
   * @default false
   */
  disabled?: boolean;
}

/**
 * An input, e.g. for text input.
 */
function Input({
  type = 'text',
  id = undefined,
  label = undefined,
  placeholder = undefined,
  fullWidth = false,
  disabled = false,
}: InputProps) {
  const renderedLabel = label && id ? (
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
  ) : null;

  const className = classNames(
    'focus:ring-blue-300 focus:border-blue-300 block w-full px-5 sm:text-sm border-gray-300 rounded-md dark:border-gray-600 dark:placeholder-gray-400 dark:text-white',
    {
      'cursor-not-allowed bg-slate-50 dark:bg-gray-700': disabled,
    },
  );

  return (
    <div className={classNames({ 'w-full': fullWidth })}>
      {renderedLabel}
      <div className="relative rounded-md shadow-sm">
        <input
          type={type}
          name={id}
          id={id}
          className={className}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={disabled}
        />
      </div>
    </div>
  );
}

export default Input;
