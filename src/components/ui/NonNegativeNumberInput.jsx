export default function NonNegativeNumberInput({
  onChange,
  onKeyDown,
  onPaste,
  onDrop,
  ...props
}) {
  const handleChange = (event) => {
    if (event.currentTarget.valueAsNumber < 0) event.currentTarget.value = "";
    onChange?.(event);
  };

  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (
      !event.defaultPrevented &&
      ["-", "−", "Subtract"].includes(event.key)
    ) {
      event.preventDefault();
    }
  };

  const handlePaste = (event) => {
    onPaste?.(event);
    if (/[-−]/.test(event.clipboardData.getData("text"))) {
      event.preventDefault();
    }
  };

  const handleDrop = (event) => {
    onDrop?.(event);
    if (/[-−]/.test(event.dataTransfer.getData("text"))) {
      event.preventDefault();
    }
  };

  return (
    <input
      min="0"
      {...props}
      type="number"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onDrop={handleDrop}
    />
  );
}
