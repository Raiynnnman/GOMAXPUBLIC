import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
    Container,
    Grid,
    TextField,
    Button,
    Typography,
    Paper,
    Box,
    CssBaseline,
    Snackbar,
    Alert
} from '@mui/material';
import Navbar from '../../components/Navbar';
import Pricing from '../../components/Pricing';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import AppSpinner from '../utils/Spinner';
import formatPhoneNumber from '../utils/formatPhone';
import { getLandingData } from '../../actions/landingData';
import { searchProvider } from '../../actions/searchProvider';
import { registerProvider } from '../../actions/registerProvider';

import { squareAppKey, squareLocationKey } from '../../squareConfig';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#FF5733',
        },
    },
    typography: {
        fontFamily: "'Montserrat', sans-serif",
    },
});

class RegisterProvider extends Component {
    state = {
        page: 0,
        plan: 0,
        selectedAddrId: null,
        card: null,
        currentName: '',
        currentPhone: '',
        first: '',
        last: '',
        phone: '',
        email: '',
        error_message: null,
        pq_id: null,
        coupon: null,
        setPrice: 0,
        calculatedPrice: 0,
        coupon_id: null,
        couponRed: '$0.00',
        couponRedValue: 0,
        addresses: [],
        showAddresses: [],
        intentid: '',
        selPlan: null,
        license: '',
        provtype: 1,
        provtypeSel: ['Chiropractor'],
        showPaymentForm: false,
        snackbarOpen: false,
        snackbarMessage: '',
        snackbarSeverity: 'success'
    };

    componentDidMount() {
        const { id, pq_id } = this.props.match.params;
        this.setState({ plan: id, pq_id });
        this.props.dispatch(
            getLandingData({ type: this.state.provtype, pq_id })
        );
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.landingData !== prevProps.landingData &&
            this.props.landingData.data
        ) {
            const { pq, pricing } = this.props.landingData.data;
            if (pq && this.state.pq_id && !this.state.phone) {
                this.setState({
                    phone: formatPhoneNumber(pq.phone),
                    first: `${pq.first_name} ${pq.last_name}`,
                    name: pq.name,
                    email: pq.email,
                    showAddresses: pq.addr,
                    selPlan: pricing.find((e) => parseInt(pq.plan) === e.id) || null,
                });
            } else if (pricing && !this.state.selPlan) {
                this.setState({
                    selPlan: pricing.find((e) => parseInt(this.state.plan) === e.id) || null,
                });
            }
        }

        if (this.props.searchProvider !== prevProps.searchProvider && this.state.page === 1 && !this.state.pq_id) {
            const potentialAddresses = this.props.searchProvider.data.potentials;
            if (potentialAddresses) {
                const newAddresses = potentialAddresses.map((e) => e.id).sort();
                const currentAddresses = this.state.showAddresses.map((e) => e.id).sort();
                if (JSON.stringify(newAddresses) !== JSON.stringify(currentAddresses)) {
                    this.setState({ showAddresses: potentialAddresses });
                }
            }
        }
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value }, this.checkValid);
    };

    handlePhoneChange = (event) => {
        const phone = formatPhoneNumber(event.target.value);
        this.setState({ phone });
    };

    handleCouponChange = (event) => {
        this.setState({ coupon: event.target.value }, this.getCoupon);
    };

    getCoupon = () => {
        const { coupon, selPlan } = this.state;
        const matchingCoupon = selPlan.coupons.find((e) => coupon === e.name);
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
        this.setState((prevState) => ({ page: prevState.page + 1 }), this.searchProvider);
    };

    searchProvider = () => {
        const { name, phone, email } = this.state;
        this.props.dispatch(searchProvider({ n: name, p: phone, e: email }));
    };

    saveCard = (card, intentid) => {
        this.setState({ card, intentid }, this.registerProvider);
    };

    registerProvider = () => {
        const { email, first, name, phone, selPlan, card, last, zipcode, showAddresses, coupon_id, pq_id, provtype } = this.state;
        const verifiedAddresses = showAddresses.filter((e) => e.verified);
        const registrationData = {
            email,
            first,
            name,
            phone,
            plan: selPlan.id,
            provtype,
            card,
            last,
            zipcode,
            addresses: verifiedAddresses,
            coupon_id,
            pq_id,
        };

        this.props.dispatch(registerProvider(registrationData, (err, args) => {
            if (err) {
                this.setState({
                    snackbarOpen: true,
                    snackbarMessage: err.message,
                    snackbarSeverity: 'error'
                });
                return;
            }
            window.location = '/welcome';
        }));
    };

    checkValid = () => {
        // Implement validation logic
        this.setState({ isValid: true });
    };

    handleCloseSnackbar = () => {
        this.setState({ snackbarOpen: false });
    };

    render() {
        const { page, selPlan, phone, couponRed, error_message, snackbarOpen, snackbarMessage, snackbarSeverity } = this.state;
        const { registerProvider, searchProvider, landingData } = this.props;

        return (
            <ThemeProvider theme={defaultTheme}>
                <Navbar />
                <CssBaseline />
                {(registerProvider.isReceiving || searchProvider.isReceiving) && <AppSpinner />}
                <Pricing />
                {landingData.data && (
                    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to right, #fff7e6, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
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
                            >
                                {selPlan && (
                                    <>
                                        {page === 0 && (
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
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            required
                                                            label="Practice Name"
                                                            name="name"
                                                            onChange={this.handleInputChange}
                                                            margin="normal"
                                                            sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            required
                                                            label="First Name"
                                                            name="first"
                                                            onChange={this.handleInputChange}
                                                            margin="normal"
                                                            sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            required
                                                            label="Last Name"
                                                            name="last"
                                                            onChange={this.handleInputChange}
                                                            margin="normal"
                                                            sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            required
                                                            label="Email"
                                                            name="email"
                                                            onChange={this.handleInputChange}
                                                            margin="normal"
                                                            sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            required
                                                            label="Phone"
                                                            name="phone"
                                                            value={phone}
                                                            onChange={this.handlePhoneChange}
                                                            margin="normal"
                                                            sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={this.nextPage}
                                                        sx={{ borderRadius: 8, backgroundColor: '#FF5733', color: '#fff', padding: '10px 45px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
                                                    >
                                                        {landingData.data.do_billing_charge !== 0 ? 'Next' : 'Register'}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}
                                        {page === 1 && landingData.data.do_billing_charge !== 0 && (
                                            <Box sx={{ mt: 3 }}>
                                                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                                                    <Typography variant="h6" gutterBottom>
                                                        Checkout
                                                    </Typography>
                                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                                        <Grid item xs={7}>
                                                            <Typography variant="body1">Description</Typography>
                                                        </Grid>
                                                        <Grid item xs={5} textAlign="right">
                                                            <Typography variant="body1">Price</Typography>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Typography variant="body2">{selPlan.description}</Typography>
                                                        </Grid>
                                                        <Grid item xs={12} textAlign="right">
                                                            <Typography variant="body2">${parseFloat(selPlan.upfront_cost * selPlan.duration).toFixed(2)}</Typography>
                                                        </Grid>
                                                        {selPlan.coupons.length > 0 && (
                                                            <>
                                                                <Grid item xs={7}>
                                                                    <TextField
                                                                        fullWidth
                                                                        placeholder="Enter Coupon Code"
                                                                        value={this.state.coupon}
                                                                        onChange={this.handleCouponChange}
                                                                        sx={{ backgroundColor: '#eee', borderRadius: '8px' }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={5} textAlign="right">
                                                                    <Typography variant="body2">{couponRed}</Typography>
                                                                </Grid>
                                                            </>
                                                        )}
                                                    </Grid>
                                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                                        <Grid item xs={7}>
                                                            <Typography variant="body1">Total</Typography>
                                                        </Grid>
                                                        <Grid item xs={5} textAlign="right">
                                                            <Typography variant="body1">{this.calculatePrice()}</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                                <Box sx={{ mt: 3 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        sx={{ borderRadius: 8, backgroundColor: '#FF5733', color: '#fff', padding: '10px 45px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', mb: 2 }}
                                                        onClick={() => this.setState({ showPaymentForm: true })}
                                                    >
                                                        Proceed to Checkout
                                                    </Button>
                                                    {this.state.showPaymentForm && (
                                                        <PaymentForm
                                                            applicationId={squareAppKey}
                                                            locationId={squareLocationKey}
                                                            cardTokenizeResponseReceived={(token, buyer) => {
                                                                const cardData = {
                                                                    id: token.token,
                                                                    brand: buyer.card.brand,
                                                                    expiration: `${buyer.card.expMonth}/${buyer.card.expYear}`,
                                                                    lastFour: buyer.card.last4,
                                                                };
                                                                this.saveCard(cardData, buyer.intentId);
                                                            }}
                                                            createVerificationDetails={() => ({
                                                                amount: `${parseFloat(this.state.selPlan.upfront_cost * this.state.selPlan.duration).toFixed(2)}`,
                                                                currencyCode: 'USD',
                                                                intent: 'CHARGE',
                                                                billingContact: {
                                                                    familyName: this.state.last,
                                                                    givenName: this.state.first,
                                                                    email: this.state.email,
                                                                    phone: this.state.phone,
                                                                },
                                                            })}
                                                        >
                                                            <CreditCard />
                                                        </PaymentForm>
                                                    )}
                                                </Box>
                                            </Box>
                                        )}
                                    </>
                                )}
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
    searchProvider: state.searchProvider,
});

export default withRouter(connect(mapStateToProps)(RegisterProvider));
