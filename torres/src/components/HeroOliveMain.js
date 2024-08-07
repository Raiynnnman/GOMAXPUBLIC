import React, { Component } from "react";
import siteSelectionConfig from '../siteSelectionConfig';
import TemplateButton from '../pain/utils/TemplateButton';
import Grid from '@mui/material/Grid';



class HeroOliveMain extends Component {
    forwardURL = (e) => { 
        var v = siteSelectionConfig(e);
        console.log("forward: ", v);
        window.location = v;
    }
    render(){
        return(
            <div className={`header-area-main ${this.props.horizontal} ${this.props.bgshape}`} id="home" >
                <div className="header-bg"/>
                <div className="h-100 ">
                    <div className="row">
                        <div className="col-lg-12 h-100">
                                <Grid container xs={12}>
                                    <Grid item xs={12} md={1.5} style={{margin:0}}></Grid>
                                    <Grid item xs={12} md={3} style={{margin:20}}>
                                        <div style={{height:300,backgroundColor:"rgba(0,0,0,.5)",borderRadius:15}}> 
                                            <div style={{margin:0,position:"relative",top:"30%"}}> 
                                                <div style={{display:"flex",alignContent:"center",justifyContent:"center"}}>
                                                    <font style={{color:"white",fontSize:24,fontWeight:"bold"}}>
                                                        Are you a patient?    
                                                    </font>
                                                </div>
                                                <div style={{marginTop:20,display:"flex",justifyContent:"center"}}>
                                                    <TemplateButton label="CLICK HERE" onClick={() => this.forwardURL("patient")}/>
                                                </div>
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={3} style={{margin:20}}>
                                        <div style={{height:300,backgroundColor:"rgba(0,0,0,.5)",borderRadius:15}}> 
                                            <div style={{margin:0,position:"relative",top:"30%"}}> 
                                                <div style={{display:"flex",alignContent:"center",justifyContent:"center"}}>
                                                    <font style={{color:"white",fontSize:24,fontWeight:"bold"}}>
                                                        Are you a Provider?    
                                                    </font>
                                                </div>
                                                <div style={{marginTop:20,display:"flex",justifyContent:"center"}}>
                                                    <TemplateButton label="CLICK HERE" onClick={() => this.forwardURL("patient")}/>
                                                </div>
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={3} style={{margin:20}}>
                                        <div style={{height:300,backgroundColor:"rgba(0,0,0,.5)",borderRadius:15}}> 
                                            <div style={{margin:0,position:"relative",top:"30%"}}> 
                                                <div style={{display:"flex",alignContent:"center",justifyContent:"center"}}>
                                                    <font style={{color:"white",fontSize:24,fontWeight:"bold"}}>
                                                        Are you a Lawyer?    
                                                    </font>
                                                </div>
                                                <div style={{marginTop:20,display:"flex",justifyContent:"center"}}>
                                                    <TemplateButton label="CLICK HERE" onClick={() => this.forwardURL("patient")}/>
                                                </div>
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={1.5} style={{margin:0}}></Grid>
                                </Grid>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default HeroOliveMain;








