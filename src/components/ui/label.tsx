import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

const Label: React.FC<LabelProps> = ({ children, required, style, ...props }) => (
    <label
        style={{
            display: 'block',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: '#888',
            marginBottom: 6,
            ...style,
        }}
        {...props}
    >
        {children}
        {required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
);

export default Label;
