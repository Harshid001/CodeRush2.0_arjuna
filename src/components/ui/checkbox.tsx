import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, style, ...props }, ref) => (
        <div>
            <label
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#999',
                }}
            >
                <input
                    ref={ref}
                    type="checkbox"
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`,
                        background: 'rgba(255,255,255,0.03)',
                        accentColor: '#5a9a5a',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: 1,
                        ...style,
                    }}
                    {...props}
                />
                {label && <span>{label}</span>}
            </label>
            {error && (
                <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                    {error}
                </p>
            )}
        </div>
    )
);
Checkbox.displayName = 'Checkbox';
export default Checkbox;
