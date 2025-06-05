import React from 'react'
import './../css/forms.css' // Εισαγωγή του CSS αρχείου

export default function InputEntryModal ({
  entry,
  id,
  type = 'text',
  value,
  onChange,
  example,
  error,
  required = false,
  className = '',
  ...props
}) {
  // Έλεγχος αν το πεδίο έχει σφάλμα για να εφαρμοστεί το κατάλληλο στυλ
  const hasError = error && error.length > 0

  // Συνδυασμένες κλάσεις που χρησιμοποιούν το input-field από το CSS και επιπλέον στιλ για σφάλματα
  const inputClasses = `input-field ${
    hasError ? 'error-input' : ''
  } ${className}`

  return (
    <div className='mb-4'>
      <label htmlFor={id} className='label-name'>
        {entry}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={example}
        className={inputClasses}
        required={required}
        {...props}
      />

      {hasError && <div className='text-red-500 text-xs mt-1'>{error}</div>}
    </div>
  )
}
