import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
    Container,
    Grid,
    Button,
    Typography,
    Paper,
    Box,
    CssBaseline,
    Snackbar,
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import Navbar from '../../components/Navbar';
import Pricing from '../../components/Pricing';
import AppSpinner from '../utils/Spinner';
import formatPhoneNumber from '../utils/formatPhone';
import { getLandingData } from '../../actions/landingData';
import { registerProvider } from '../../actions/registerProvider';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import TemplateTextFieldPhone from '../utils/TemplateTextFieldPhone';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateButton from '../utils/TemplateButton';

class UserRegistration extends Component {
    formRef = createRef();

    state = {
        page: 0,
        plan: 0,
        card: null,
        currentName: '',
        currentPhone: '',
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        zipcode: '',
        error_message: null,
        pq_id: null,
        coupon: null,
        setPrice: 0,
        calculatedPrice: 0,
        coupon_id: null,
        couponRed: '$0.00',
        couponRedValue: 0,
        showAddresses: [],
        intentid: '',
        selPlan: null,
        license: '',
        provtype: 3,
        provtypeSel: ['Referrer'],
        snackbarOpen: false,
        snackbarMessage: '',
        snackbarSeverity: 'success'
    };

    componentDidMount() {
        this.props.dispatch(getLandingData({ type: this.state.provtype }));
        this.state.selPlan = {}
        this.state.page = 0
    }

    componentDidUpdate(prevProps) {
    }

    handleNameChange = (event) => {
        const { name, value } = event.target;
        this.setState({ name: value }, this.checkValid);
    }

    handleFirstChange = (event) => {
        const { name, value } = event.target;
        this.setState({ first: value }, this.checkValid);
    }

    handleLastChange = (event) => {
        const { name, value } = event.target;
        this.setState({ last: value }, this.checkValid);
    }

    handleEmailChange = (event) => {
        const { name, value } = event.target;
        this.setState({ email: value }, this.checkValid);
    }


    handlePhoneChange = (event) => {
        const phone = formatPhoneNumber(event.target.value);
        this.setState({ phone });
    };

    handleCouponChange = (event) => {
        this.setState({ coupon: event.target.value }, this.getCoupon);
    };

    getCoupon = () => {
        const { coupon, selPlan } = this.state;
        const matchingCoupon = selPlan?.coupons.find((e) => coupon === e.name);
        if (matchingCoupon) {
            const discountValue = this.calculateDiscount(matchingCoupon);
            this.setState({
                coupon_id: matchingCoupon.id,
                couponRed: `($${discountValue.toFixed(2)})`,
                couponRedValue: -discountValue.toFixed(2),
            });
        } else {
            this.setState({ couponRed: '$0.00', couponRedValue: 0.00 });
        }
    };

    calculateDiscount = (coupon) => {
        const totalCost = this.state.selPlan.upfront_cost * this.state.selPlan.duration;
        if (coupon.perc) {
            return totalCost * coupon.perc;
        } else if (coupon.total) {
            return totalCost - coupon.total;
        } else if (coupon.reduction) {
            return coupon.reduction;
        }
        return 0;
    };

    calculatePrice = () => {
        const { selPlan, couponRedValue } = this.state;
        if (selPlan) {
            const totalCost = selPlan.upfront_cost * selPlan.duration;
            const finalPrice = totalCost + parseFloat(couponRedValue);
            return `$${finalPrice.toFixed(2)}`;
        }
        return '$0.00';
    };

    nextPage = () => {
        this.setState((prevState) => ({ page: prevState.page + 1 }));
    };

    prevPage = () => {
        this.setState((prevState) => ({ page: prevState.page - 1 }));
    };

    registerUser = () => {
        const { email, first_name, name, phone, last_name, provtype } = this.state;
        const registrationData = {
            email,
            first_name,
            name,
            phone,
            last_name
        };
        this.props.onRegister(registrationData);

    };

    checkValid = () => {
        this.setState({ isValid: true });
    };

    handleCloseSnackbar = () => {
        this.setState({ snackbarOpen: false });
    };

    handleSelectPlan = (planId) => {
        const { landingData } = this.props;
        const selectedPlan = landingData.data.pricing.find(plan => plan.id === planId);
        this.setState({ selPlan: selectedPlan, page: 0 }, () => {
            if (this.formRef.current) {
                this.formRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        });
    };

    renderStepContent = (step) => {
        const { selPlan, phone, couponRed, error_message, snackbarOpen, snackbarMessage, snackbarSeverity } = this.state;
        const { registerProvider, landingData } = this.props;
        switch (step) {
            case 0:
                return (
                    <Box component="form" noValidate sx={{ mt: 1 }}>
                        <Typography variant="h6" align="center" gutterBottom>
                            Please enter the information below to register
                        </Typography>
                        {error_message && (
                            <Typography color="error" gutterBottom>
                                {error_message}
                            </Typography>
                        )}
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TemplateTextField
                                    fullWidth
                                    required
                                    label="First Name"
                                    name="first"
                                    onChange={this.handleFirstChange}
                                    margin="normal"
                                    sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TemplateTextField
                                    fullWidth
                                    required
                                    label="Last Name"
                                    name="last"
                                    onChange={this.handleLastChange}
                                    margin="normal"
                                    sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TemplateTextField
                                    fullWidth
                                    required
                                    label="Email"
                                    name="email"
                                    onChange={this.handleEmailChange}
                                    margin="normal"
                                    sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TemplateTextFieldPhone
                                    fullWidth
                                    required
                                    label="Phone"
                                    name="phone"
                                    value={phone}
                                    onChange={this.handlePhoneChange}
                                    margin="normal"
                                    sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <TemplateButton
                                variant="contained"
                                color="primary"
                                onClick={this.registerUser}
                                sx={{ borderRadius: 8, backgroundColor: '#FF5733', color: '#fff', padding: '10px 45px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
                                label='Register'/>
                        </Box>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    render() {
        const { page, selPlan, snackbarOpen, snackbarMessage, snackbarSeverity } = this.state;
        const { registerUser, landingData } = this.props;

        var steps = ['Register Information'];

        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {registerProvider.isReceiving && <AppSpinner />}
                {landingData.data && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                        <Container maxWidth="md">
                            <Paper
                                elevation={12}
                                sx={{
                                    width: '100%',
                                    padding: { xs: 2, sm: 4, md: 6 },
                                    borderRadius: '30px',
                                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.35)',
                                    backgroundColor: '#fff',
                                }}
                                ref={this.formRef}
                            >
                                <Stepper activeStep={page} alternativeLabel>
                                    {steps.map((label) => (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                                {this.renderStepContent(page)}
                                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                    <Button
                                        color="inherit"
                                        disabled={page === 0}
                                        onClick={this.prevPage}
                                        sx={{ mr: 1 }}
                                    >
                                        Back
                                    </Button>
                                </Box>
                            </Paper>
                        </Container>
                    </Box>
                )}
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={this.handleCloseSnackbar}>
                    <Alert onClose={this.handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </ThemeProvider>
        );
    }
}

const mapStateToProps = (state) => ({
    landingData: state.landingData,
    registerProvider: state.registerProvider,
});

export default withRouter(connect(mapStateToProps)(UserRegistration));
