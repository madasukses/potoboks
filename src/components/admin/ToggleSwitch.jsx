/**
 * Switch iOS-style
 * Props:
 * - checked: boolean
 * - onChange: (checked) => void
 * - disabled: boolean
 * - size: 'sm' | 'md' (default: 'md')
 */
export default function ToggleSwitch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
}) {
  const dims =
    size === 'sm'
      ? { w: 44, h: 24, knob: 18, pad: 3 }
      : { w: 56, h: 30, knob: 24, pad: 3 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={
        'relative inline-flex items-center rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-kuning-300 ' +
        (checked
          ? 'bg-green-500 border-green-700'
          : 'bg-gray-300 border-gray-500') +
        (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer')
      }
      style={{
        width: dims.w,
        height: dims.h,
        padding: dims.pad,
      }}
    >
      <span
        className="bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center"
        style={{
          width: dims.knob,
          height: dims.knob,
          transform: checked
            ? 'translateX(' + (dims.w - dims.knob - dims.pad * 2 - 4) + 'px)'
            : 'translateX(0)',
        }}
      />
    </button>
  );
}