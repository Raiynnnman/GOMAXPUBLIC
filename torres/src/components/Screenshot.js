import React, { Component } from "react";


class Screenshot extends Component { 
    render(){
        return (
            <div className="screenshot-area pt--120" id="screenshots">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title text-center">
                                <h2>APP <span className="theme-color">SCREENSHOTS</span></h2>
                                <img className="image-1" src={require('../assets/images/app/title-icon-3.png')} alt="App Landing"/>
                            </div>
                        </div>
                        <div className="col-lg-10 offset-lg-1">
                            <div className="screenshot-carousel" id="screenshot-carousel" data-carousel-3d>
                                <img className="image-1" src={require('../assets/main_page/screenshot-1.png')} alt="App Screenshot"/>
                                <img className="image-1" src={require('../assets/main_page/screenshot-2.png')} alt="App Screenshot"/>
                                <img className="image-1" src={require('../assets/main_page/screenshot-3.png')} alt="App Screenshot"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Screenshot;










