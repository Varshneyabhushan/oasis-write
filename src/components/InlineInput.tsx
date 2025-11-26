import { FC, useState, useEffect, useRef } from 'react';

interface InlineInputProps {
  initialValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
  validate?: (value: string) => string | null;
}

const InlineInput: FC<InlineInputProps> = ({
  initialValue = '',
  placeholder = '',
  onConfirm,
  onCancel,
  autoFocus = true,
  validate,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();

      // Select the filename without extension for rename
      if (initialValue) {
        const dotIndex = initialValue.lastIndexOf('.');
        if (dotIndex > 0) {
          inputRef.current.setSelectionRange(0, dotIndex);
        } else {
          inputRef.current.select();
        }
      }
    }
  }, [autoFocus, initialValue]);

  const handleConfirm = () => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setError('Name cannot be empty');
      return;
    }

    if (validate) {
      const validationError = validate(trimmedValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onConfirm(trimmedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Prevent losing focus
    }
  };

  const handleBlur = () => {
    // Cancel on blur
    onCancel();
  };

  return (
    <div className="inline-input-container" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        type="text"
        className={`inline-input ${error ? 'error' : ''}`}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      {error && <div className="inline-input-error">{error}</div>}
    </div>
  );
};

export default InlineInput;
