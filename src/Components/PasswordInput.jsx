import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordInput({
  name,
  placeholder,
  value,
  onChange,
  className = "",
  containerClassName = "relative w-full",
  inputClassName = "bg-gray-100 p-3 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-400",
  buttonClassName = "absolute right-3 top-3 text-gray-500 hover:text-blue-600 transition-colors",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={containerClassName}>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className={`${inputClassName} w-full ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={buttonClassName}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
