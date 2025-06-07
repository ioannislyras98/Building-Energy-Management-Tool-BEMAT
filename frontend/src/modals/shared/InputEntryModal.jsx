import React from "react";
import "./../../assets/styles/forms.css";

export default function InputEntryModal({
  entry,
  id,
  type = "text",
  value,
  onChange,
  example,
  error,
  required = false,
  className = "",
  options = [],
  ...props
}) {
  const hasError = error && error.length > 0;
  const inputClasses = `input-field ${
    hasError ? "error-input" : ""
  } ${className}`;

  const renderInput = () => {
    if (type === "select") {
      return (
        <select
          id={id}
          name={id}
          value={value || ""}
          onChange={onChange}
          className={inputClasses}
          required={required}
          {...props}>
          {example && <option value="">{example}</option>}
          {options.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      );
    }

    if (type === "textarea") {
      return (
        <textarea
          id={id}
          name={id}
          value={value || ""}
          onChange={onChange}
          placeholder={example}
          className={inputClasses}
          required={required}
          rows={3}
          {...props}
        />
      );
    }

    return (
      <input
        id={id}
        name={id}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={example}
        className={inputClasses}
        required={required}
        {...props}
      />
    );
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="label-name">
        {entry}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {hasError && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
