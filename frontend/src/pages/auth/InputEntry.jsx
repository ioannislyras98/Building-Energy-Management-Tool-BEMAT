import "./../../assets/styles/forms.css";

export default function InputEntry({
  entry,
  id,
  type,
  step,
  example,
  value,
  onChange,
  required = true,
}) {
  const classType = ["Name", "Surname"].includes(entry)
    ? "flex-auto w-1/2"
    : "block";

  return (
    <label className={classType}>
      <span className="label-name">{entry}</span>
      <input
        type={type}
        id={id}
        step={step}
        className="input-field"
        required={required}
        placeholder={example}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}
