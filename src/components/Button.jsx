export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled,
}) {
  const styles = {
    primary: 'bg-kuning-500 text-benhur-900',
    secondary: 'bg-benhur-700 text-white',
    ghost: 'bg-white text-benhur-900',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-sticker ${styles} ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
}