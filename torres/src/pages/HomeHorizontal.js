import Blog from '../components/Blog';
import React, {Component} from "react";
import { connect } from 'react-redux';
import About from '../components/About';
import Navbar from '../components/Navbar';
import FooterHome from '../components/FooterHome';
import Service from '../components/Service';
import Pricing from '../components/Pricing';
import Feature from '../components/Feature';
import Download from '../components/Download';
import HeroOlive from '../components/HeroOlive';
import Screenshot from '../components/Screenshot';
import Testimonial from '../components/Testimonial';
import { getLandingData } from '../actions/landingData';

class HomeHorizontal extends Component {
    componentDidMount() {
        this.props.dispatch(getLandingData({}));
    }
    render() {
        return (
            <div>
                {/* Header Navbar */}
                <Navbar/>

                {/* Slider */}
                <HeroOlive horizontal="horizontal" bgshape="bg-shape"/>

                <div style={{marginTop:30}}></div>
                {/* About */}
                <About horizontalabout="horizontal-about"/>

                {/*Service */}
                <Service horizontal="horizontal"/>

                {/*Feature */}
                <Feature horizontalfeature="horizontal-feature"/>

                {/* Download */}
                {/*<Download horizontal="horizontal"/>*/}

                {/* Pricing */}
                <Pricing horizontalpricing=""/>

                {/* Pricing */}
                <Testimonial/>

                {/* Screenshot */}
                <Screenshot/> 

                {/* Blog */}
                <Blog/> 

                {/* Footer */}
                <FooterHome horizontal="horizontal"/> 

            </div>
        )
    }
}

function mapStateToProps(store) {
    return {
        landingData: store.landingData
    }
}

export default connect(mapStateToProps)(HomeHorizontal);
