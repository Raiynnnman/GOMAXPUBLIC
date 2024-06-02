import React , { Component } from "react";
import getVersion from '../version';
class Footer extends Component {
    render(){
        return(
        <>
        <div>
            <div className="row">
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







