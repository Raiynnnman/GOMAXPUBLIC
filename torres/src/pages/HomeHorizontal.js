import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Navbar from '../components/Navbar';
// import Pricing from '../components/Pricing';
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
import Footer from '../components/Footer';
import { getLandingData } from '../actions/landingData';
import theme from '../theme';  
import siteType from '../siteType';
import HeroOliveMain from '../components/HeroOliveMain';
import HeroOliveLegal from '../components/HeroOliveLegal';
import HeroOliveProvider from '../components/HeroOliveProvider';
import AboutLegal from '../components/AboutLegal';
import ServiceLegal from '../components/ServiceLegal';
import TestimonialLegal from '../components/TestimonialLegal';
import ScreenshotLegal from '../components/ScreenshotLegal';
import FeatureCustomer from '../components/FeatureCustomer';
import FeatureLegal from '../components/FeatureLegal';
import HeroOlive360 from '../components/HeroOlive360';
import FooterHome360 from '../components/FooterHome360';
import Navbar360 from '../components/Navbar360';

class HomeHorizontal extends Component {
    componentDidMount() {
        this.props.dispatch(getLandingData());
    }

    handleSelectPlanLegal = (planId) => {
        const { landingData, history } = this.props;
        history.push('/meeting');
    };

    handleSelectPlanProvider = (planId) => {
        const { landingData, history } = this.props;
        const selectedPlan = landingData.data.pricing.find(plan => plan.id === planId);
        history.push('/register-provider/' + selectedPlan.id);
    };

    render() {
        return (
        <>
            <ThemeProvider theme={theme}>
                {(siteType() === 'main') && (
                <div>
                    <Navbar />
                    <HeroOliveMain horizontal="horizontal" bgshape="bg-shape" />
                    <FooterHome horizontal="horizontal" />
                </div>
                )}
                {(siteType() === 'legal') && (
                <div>
                    <Navbar />
                    <HeroOliveLegal horizontal="horizontal" bgshape="bg-shape" />
                    <div style={{ marginTop: 30 }}></div>
                    <AboutLegal horizontalabout="horizontal-about" />
                    <ServiceLegal horizontal="horizontal" />
                    <FeatureLegal horizontalfeature="horizontal-feature" />
                    {/*<Pricing office_type={2} showButton={true} onSelectPlan={this.handleSelectPlanLegal} horizontalfeature="horizontal-pricing" />*/}
                    {/*<TestimonialLegal/>*/}
                    <div style={{margin:20,backgroundColor:"black",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                {(siteType() === 'provider') && (
                <div>
                    <Navbar />
                    <HeroOliveProvider horizontal="horizontal" bgshape="bg-shape" />
                    <div style={{ marginTop: 30 }}></div>
                    <About horizontalabout="horizontal-about" />
                    <Service horizontal="horizontal" />
                    <Feature horizontalfeature="horizontal-feature" />
                    {/*<Pricing office_type={1} showButton={true} onSelectPlan={this.handleSelectPlanProvider} horizontalfeature="horizontal-pricing" />*/}
                    <Testimonial />
                    <div style={{margin:20,backgroundColor:"black",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                {(siteType() === '360bluconsulting') && (
                <div>
                    <Navbar360 />
                    <HeroOlive360 horizontal="horizontal" bgshape="bg-shape" />
                    <FooterHome360 horizontal="horizontal" />
                </div>
                )}
                {(siteType() === 'patient') && (
                <div>
                    <Navbar />
                    <HeroOliveCustomer horizontal="horizontal" bgshape="bg-shape" />
                    <div style={{ marginTop: 30 }}></div>
                    <AboutCustomer horizontalabout="horizontal-about" />
                    <ServiceCustomer horizontal="horizontal" />
                    <FeatureCustomer horizontalfeature="horizontal-feature" />
                    <TestimonialCustomer />
                    {/*<Screenshot />*/}
                    <FooterHome horizontal="horizontal" />
                </div>
                )}
            </ThemeProvider>
        </>
        );
    }
}

function mapStateToProps(store) {
    return {
        landingData: store.landingData
    }
}

export default withRouter(connect(mapStateToProps)(HomeHorizontal));
