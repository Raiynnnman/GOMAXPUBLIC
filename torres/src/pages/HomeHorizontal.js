import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import Pricing from '../components/Pricing';
import HeroOlive from '../components/HeroOlive';
import About from '../components/About';
import Service from '../components/Service';
import Feature from '../components/Feature';
import Testimonial from '../components/Testimonial';
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
                    {/*<Blog />*/}
                    <FooterHome horizontal="horizontal" />
                </div>
                )}
                {(siteType() === 'customer') && (
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
                    <Blog />
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
