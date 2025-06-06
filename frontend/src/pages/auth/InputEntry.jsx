import "./../../assets/styles/forms.css";

export default function InputEntry({
  entry,
  id,
  type,
  example,
  value,
  onChange,
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
        className="input-field"
        required
        placeholder={example}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}
