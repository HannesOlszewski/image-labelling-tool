import React from 'react';
import classNames from 'classnames';

/**
 * The properties for a `Button`.
 */
export interface ButtonProps {
  /**
   * The variant of the button.
   */
  variant: 'primary' | 'secondary';

  /**
   * Called when the button is clicked.
   */
  onClick: () => void;

  /**
   * The id for the HTML element.
   */
  id?: string;

  /**
   * The children of this component.
   */
  children?: React.ReactNode;
}

/**
 * A button that can be clicked.
 */
function Button({
  variant, onClick, id, children,
}: ButtonProps) {
  const className = classNames(
    'font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 dark:text-white',
    {
      'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800':
        variant === 'primary',
      'text-gray-900 bg-white hover:bg-gray-100 focus:ring-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700':
        variant === 'secondary',
    },
  );

  return (
    <button type="button" id={id} className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
