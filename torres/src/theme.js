import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFA500', 
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px', 
          textTransform: 'none',  
          padding: '10px 20px', 
          backgroundColor: '#FFA500',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#e59400', 
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          borderRadius: '25px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          marginTop: '25px',
          padding: '0',
          marginBottom: '30px',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: '0 20px 20px rgba(255, 165, 0, 0.8)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          borderRadius: '25px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          marginTop: '25px',
          padding: '0',
          marginBottom: '30px',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: '0 20px 20px rgba(255, 165, 0, 0.8)',
          },
        },
      },
    },
  },
});

export default theme;
