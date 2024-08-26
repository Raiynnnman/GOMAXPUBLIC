import React, { Component } from "react";
import Box from '@mui/material/Box';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TemplateButton from '../pain/utils/TemplateButton';
import CloseIcon from '@mui/icons-material/Close';

class Service extends Component{
    constructor(props) { 
        super(props);
        this.state = { 
            showVideo:false,
            showCalendar:false,
        } 
        this.showVideo = this.showVideo.bind(this);
        this.showCalendar = this.showCalendar.bind(this);
        this.closeCalendar = this.closeCalendar.bind(this);
        this.closeVideo = this.closeVideo.bind(this);
    }
    signUp() { 
        window.location = '/#pricing';
    }
    closeCalendar() { 
        this.state.showCalendar = false;
        this.setState(this.state);
    } 
    showCalendar() { 
        this.state.showCalendar = true;
        this.setState(this.state);
    } 
    closeVideo() { 
        this.state.showVideo = false;
        this.setState(this.state);
    } 
    showVideo() { 
        this.state.showVideo = true;
        this.setState(this.state);
    } 
    render(){
        let data = [
            {
                icon: 'zmdi zmdi-account-o',
                title: 'Get Started Today!',
                btn_title:'Sign up',
                desc: 'Join the network of successful care providers who have transformed their practices with Pound Pain Technology. Sign up now and see the difference.',
                click:this.signUp
            },

            {
                icon: 'zmdi zmdi-calendar',
                title: 'Schedule a Call',
                btn_title:'Schedule a Call',
                desc: 'Experience the power of Pound Pain Technology. Schedule a call for a personalized consultation and discover how our platform can transform your practice and support patient acquisition growth.',
                click:this.showCalendar
            },

            {
                icon: 'zmdi zmdi-collection-video',
                title: 'Watch How',
                btn_title:'Watch',
                desc: 'Curious to see how it all works? Watch our demo video to learn more about the features and benefits of our platform.',
                click:this.showVideo
            }
        ];
        let DataList = data.map((val, i) => {
            return(
                <div onClick={val.click ? val.click : null} className="col-lg-4 service-column" style={{cursor:'pointer'}} key={i}>
                    <div className="single-service text-center">
                        <div className="service-icon">
                            <i className={`${val.icon}`}></i>
                        </div>
                        <h4 className="title">{val.title}</h4>
                        <p className="desc">{val.desc}</p>
                        <TemplateButton label={val.btn_title} style={{backgroundColor:'#e59400'}} onClick={val.click}/>
                    </div>
                </div>
            )
        });

        return (
            <div>
                {(this.state.showCalendar) && (
                <>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <iframe 
                            src='https://calendly.com/melissa-gopoundpain/10min?_kx=p12gT4sSUTlIplHLgkYh4w.RucnQz'
                            style={{overflow:"hidden",width:window.innerWidth < 500 ? window.innerWidth : "600px",
                                    height:900
                                    }}
                            title="PoundPain Invite">
                        </iframe>
                    </div>
                </>
                )}
                {(this.state.showVideo) && (
                <>
                    <div style={{backgroundColor:"black",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <iframe src="https://player.vimeo.com/video/954405043?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
                            frameBorder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" 
                            style={{height:800,width:"100%"}}
                            title="PoundPain_video_V1_2">
                        </iframe>
                    </div>
                </>
                )}
                {/* Start Service Area */}
                {(!this.state.showVideo && !this.state.showCalendar) && (
                <div className={`service-area ${this.props.horizontal}`}>
                    <div className="container">
                        <div className="row" style={{color:'black'}}>
                            {DataList}
                        </div>
                    </div>
                </div>
                )}
                {/* End Service Area */}
            </div>
        )
    }
}
function mapStateToProps(store) {
    return {
        landingData: store.landingData
    }
}


export default withRouter(connect(mapStateToProps)(Service));

