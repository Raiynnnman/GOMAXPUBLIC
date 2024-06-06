import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

const defaultColors = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  error: '#d32f2f',
  warning: '#f57c00',
  info: '#0288d1',
  success: '#388e3c',
  default: '#000000',
};

export default function Dot({ color = 'primary', size = 8, variant, sx }) {
  const themeColor = defaultColors[color] || defaultColors.default;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: variant === 'outlined' ? 'transparent' : themeColor,
        border: variant === 'outlined' ? `1px solid ${themeColor}` : 'none',
        ...sx,
      }}
    />
  );
}

Dot.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  variant: PropTypes.string,
  sx: PropTypes.object,
};
