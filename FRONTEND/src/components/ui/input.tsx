import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ error, style, ...props }, ref) => (
        <div>
            <input
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
                    transition: 'border-color 0.2s, background 0.2s',
                    ...style,
                }}
                {...props}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    props.onBlur?.(e);
                }}
            />
            {error && (
                <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                    {error}
                </p>
            )}
        </div>
    )
);
Input.displayName = 'Input';
export default Input;
