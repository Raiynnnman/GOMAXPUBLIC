import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import Pricing from '../components/Pricing';
import HeroOlive from '../components/HeroOlive';
import HeroOliveCustomer from '../components/HeroOliveCustomer';
import About from '../components/About';
import AboutCustomer from '../components/AboutCustomer';
import Service from '../components/Service';
import ServiceCustomer from '../components/ServiceCustomer';
import Feature from '../components/Feature';
import Testimonial from '../components/Testimonial';
import TestimonialCustomer from '../components/TestimonialCustomer';
import Screenshot from '../components/Screenshot';
import Blog from '../components/Blog';
import FooterHome from '../components/FooterHome';
import { getLandingData } from '../actions/landingData';
import theme from '../theme';  
import siteType from '../siteType';

class HomeHorizontal extends Component {
    componentDidMount() {
        this.props.dispatch(getLandingData());
    }

    handleSelectPlan = (planId) => {
        const { landingData, history } = this.props;
        const selectedPlan = landingData.data.pricing.find(plan => plan.id === planId);
        history.push('/register-provider', { selectedPlan });
    };

    render() {
        return (
            <ThemeProvider theme={theme}>
                {(siteType() === 'provider') && (
                <div>
                    <Navbar />
                    <HeroOlive horizontal="horizontal" bgshape="bg-shape" />
                    <div style={{ marginTop: 30 }}></div>
                    <About horizontalabout="horizontal-about" />
                    <Service horizontal="horizontal" />
                    <Feature horizontalfeature="horizontal-feature" />
                    <Pricing showButton={true} onSelectPlan={this.handleSelectPlan} horizontalfeature="horizontal-pricing" />
                    <Testimonial />
                    <Screenshot />
                    <FooterHome horizontal="horizontal" />
                </div>
                )}
                {(siteType() === 'customer') && (
                <div>
                    <Navbar />
                    <HeroOliveCustomer horizontal="horizontal" bgshape="bg-shape" />
                    <div style={{ marginTop: 30 }}></div>
                    <AboutCustomer horizontalabout="horizontal-about" />
                    <ServiceCustomer horizontal="horizontal" />
                    <TestimonialCustomer />
                    <Screenshot />
                    <FooterHome horizontal="horizontal" />
                </div>
                )}
            </ThemeProvider>
        );
    }
}

function mapStateToProps(store) {
    return {
        landingData: store.landingData
    }
}

export default withRouter(connect(mapStateToProps)(HomeHorizontal));
