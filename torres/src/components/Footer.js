import React , { Component } from "react";
import getVersion from '../version';
class Footer extends Component {
    render(){
        return(
        <>
        <div style={{position: 'relative'}}>
            <div className="row" style={{position:'absolute',bottom:10}}>
                <div style={{fontSize:12,marginLeft:10}} className="footer-text text-left">
                    <span>Copyright POUNDPAIN TECH© {new Date().getFullYear()} <a href="https://poundpain.com">{getVersion()}</a></span>
                </div>
            </div>
        </div>
        </>
        )
    }
}
export default Footer







