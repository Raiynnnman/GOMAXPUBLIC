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
        history.push('/register-provider/' + selectedPlan.id);
    };

    render() {
        console.log(this.props)
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
                    <div style={{marginTop:20,backgroundColor:"black",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <iframe src="https://player.vimeo.com/video/954405043?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
                            frameBorder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" 
                            style={{height:800,width:"100%"}}
                            title="PoundPain_video_V1_2">
                        </iframe>
                    </div>
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
