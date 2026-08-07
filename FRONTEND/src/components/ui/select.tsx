import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ error, options, placeholder, style, ...props }, ref) => (
        <div>
            <select
                ref={ref}
                style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: 'rgba(255,255,255,0.03)',
                    color: '#e0e0e0',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: 36,
                    transition: 'border-color 0.2s',
                    ...style,
                }}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: '#101012', color: '#e0e0e0' }}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                    {error}
                </p>
            )}
        </div>
    )
);
Select.displayName = 'Select';
export default Select;
