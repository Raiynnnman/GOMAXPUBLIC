import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Grid, Paper, Typography, Button, List, ListItem, ListItemText, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  pricingTableArea: {
    paddingTop: 20,
    paddingBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: 50,
  },
  pricingColumn: {
    marginTop: 20,
  },
  pricePackage: {
    overflow: 'hidden',
    borderRadius: 25,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: '0 20px 20px rgba(255, 165, 0, 0.8)', 
    },
    marginTop: 25,
    padding: 0,
  },
  pricePackageTop: {
    backgroundColor: '#fa6a0a',
    color: '#fff',
    padding: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
  },
  pricePackageContent: {
    padding: 20,
  },
  price: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  priceTop: {
    fontSize: '1.25rem',
  },
  priceLarge: {
    fontSize: '3rem',
  },
  priceBottom: {
    fontSize: '1rem',
  },
  priceList: {
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#fa6a0a',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#e55d00',
    },
    borderRadius: 10,
  },
  benefitIcon: {
    width: 20,
    marginRight: 15,
    color: '#fa6a0a',
  },
  benefitText: {
    color: 'gray',
    fontFamily: 'serif',
  },
  whiteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centerCard: {
    transform: 'scale(1.1)',
  },
}));

const Pricing = ({ onSelectPlan, showButton }) => {
  const classes = useStyles();
  const landingData = useSelector((store) => store.landingData);

  if (!landingData?.data?.pricing?.length) return null;

  return (
    <Box className={classes.pricingTableArea} id="pricing">
      <Container>
        <div className={classes.sectionTitle}>
          <Typography variant="h2" component="h2">
            Pricing plans for teams of all sizes
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Pick the right pricing for your team!
          </Typography>
        </div>
        <Grid container spacing={4} justifyContent="center">
          {landingData.data.pricing.map((plan, index) => (
            <Grid
              item
              key={index}
              xs={12}
              sm={6}
              md={4}
              className={classes.pricingColumn}
            >
              <Paper className={`${classes.pricePackage} ${index === 1 ? classes.centerCard : ''}`} elevation={4}>
                <div className={classes.pricePackageTop}>
                  <Typography variant="h6" component="h6" className={classes.whiteText}>
                    {plan.cycle === 'monthly' ? 'Monthly' : 'Annual'} Plan
                  </Typography>
                  <Typography variant="h5" component="h3" className={classes.whiteText}>
                    {plan.description}
                  </Typography>
                </div>
                <div className={classes.pricePackageContent}>
                  <div className={classes.price}>
                    <Typography component="span" className={classes.priceTop}>$</Typography>
                    <Typography component="span" className={classes.priceLarge}>{plan.price}</Typography>
                    <Typography component="span" className={classes.priceBottom}>/month</Typography>
                  </div>
                  <List className={classes.priceList}>
                    {plan.benefits.map((benefit, idx) => (
                      <ListItem key={idx} disableGutters>
                        <svg
                          className={`h-5 w-5 shrink-0 ${classes.benefitIcon}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <ListItemText primary={benefit.description} className={classes.benefitText} />
                      </ListItem>
                    ))}
                  </List>
                  {showButton && (
                    <Button
                      variant="contained"
                      className={classes.button}
                      onClick={() => onSelectPlan(plan.id)}
                      fullWidth
                    >
                      Sign up
                    </Button>
                  )}
                </div>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Pricing;
