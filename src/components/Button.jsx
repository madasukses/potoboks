export default function Button({ children, onClick, variant='primary', className='', disabled }) {
  const styles = {
    primary:   'bg-kuning-500 text-benhur-900',
    secondary: 'bg-benhur-700 text-white',
    ghost:     'bg-white text-benhur-900',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-sticker ${styles} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {children}
    </button>
  );
}