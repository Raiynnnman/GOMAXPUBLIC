import React ,  { Component } from "react";
import { connect } from 'react-redux';
import Demo from './demo/Demo';
import { ToastContainer } from 'react-toastify';
import DemoTF from './demo/DemoTF';
import BlogGrid from './pages/BlogGrid';
import HomeOlive from './pages/HomeOlive';
import BlogDetails from './pages/BlogDetails';
import BlogTwoColumn from './pages/BlogTwoColumn';
import HomeHorizontal from './pages/HomeHorizontal';
import {Redirect, BrowserRouter, Switch, Route} from 'react-router-dom';
import Login from './pain/login/Login';
import InvestorMap from './pain/investor/InvestorMap';
import Dashboard from './pain/dashboard/Dashboard';
import RegisterProvider from './pain/landing/RegisterProvider';
import RegisterReferrer from './pain/landing/RegisterReferrer';
import RegisterLegal from './pain/landing/RegisterLegal';
import Welcome from './pain/welcome/Welcome';
import Forgot from './pain/forgot/Forgot';
import Reset from './pain/reset/Reset';
import 'react-toastify/dist/ReactToastify.css'
import SearchAdmin from './pain/admin/SearchAdmin';
import Map from './pain/admin/Map';
import Registrations from './pain/admin/Registrations';
import Referrers from './pain/admin/Referrers';
import Register from './pain/register/Register';
import OfficeAdminList from './pain/admin/OfficeAdminList';
import InvoiceAdminList from './pain/admin/InvoiceAdminList';
import CommissionAdminList from './pain/admin/CommissionAdminList';
import CouponAdminList from './pain/admin/CouponAdminList';
import PricingList from './pain/admin/PricingList';
import UserAdminList from './pain/admin/UserAdminList';
import OfficeAddresses from './pain/office/OfficeAddresses';
import Customers from './pain/office/Customers';
import Search from './pain/search/Search';
import Appointments from './pain/clients/Appointments';
import Landing from './pain/landing/Landing.js';
import Verified from './pain/landing/Verified';
import Accept from './pain/referral_accept/Accept';
import Reject from './pain/referral_accept/Reject';
import ChatUser from './pain/chatUser/ChatUser.js';
import Pricing from './components/Pricing';
import Join from './pain/online-demo/Join';
import OnlineDemoList from './pain/admin/OnlineDemoList';
import Tickets from "./pain/admin/Tickets";
import Calendar from "./pain/calendar/Calender";
const CloseButton = ({closeToast}) => <i onClick={closeToast} className="la la-close notifications-close"/>

class App extends Component {

    render() { 
        if (window.location.hash.startsWith('#/')) {
            window.location = window.location.hash.replace('#', '')
        }
        if (this.props.currentUser && this.props.currentUser.entitlements && 
              this.props.currentUser.entitlements.includes('InvestorView') &&
              !window.location.href.includes("incidentmap")) {
            window.location =  '/app/main/view/incidentmap'
        } else if (this.props.currentUser && this.props.currentUser.entitlements && 
            !window.location.href.includes("/app/main")) { 
            window.location =  '/app/main/dashboard'
        } 
        return (
            <div className="App">
                <ToastContainer
                    autoClose={5000}
                    hideProgressBar
                    theme='colored'
                    closeOnClick
                    closeButton={<CloseButton/>}
                />
                <BrowserRouter basename={'/'}>
                    <Switch>
                        <Route path="/app" exact render={() => <Redirect to="/app/main"/>}/>
                        <Route path="/app/main" exact render={() => <Redirect to="/app/main/dashboard"/>}/>
                        <Route exact path='/' component={HomeHorizontal}/>
                        <Route exact path='/login' component={Login}/>
                        <Route exact path='/register' component={Register}/>
                        <Route exact path='/search' component={Search}/>
                        <Route exact path="/accept/:token" component={Accept}/> 
                        <Route exact path="/reject/:token" component={Reject}/> 
                        <Route exact path='/demo' component={Landing}/>
                        <Route exact path='/introduction' component={Landing}/>
                        <Route exact path='/meeting' component={Landing}/>
                        <Route exact path='/newmeeting' component={Calendar}/>
                        <Route exact path='/referral' component={Landing}/>
                        <Route exact path='/forgot' component={Forgot}/>
                        <Route exact path='/verify/:token' component={Verified}/>
                        <Route exact path='/reset/:token' component={Reset}/>
                        <Route exact path='/register-provider' component={RegisterProvider}/>
                        <Route exact path='/register-referrer' component={RegisterReferrer}/>
                        <Route exact path='/welcome' component={Welcome}/>
                        <Route exact path='/register-provider/:id' component={RegisterProvider}/>
                        <Route exact path='/register-legal' component={RegisterLegal}/>
                        <Route exact path='/register-legal/:id' component={RegisterLegal}/>
                        <Route exact path='/online-demo/:token' component={Join}/>
                        <Route exact path='/app/main/dashboard' component={Dashboard}/>
                        <Route exact path='/app/main/admin/investors' component={InvestorMap}/>
                        <Route exact path='/app/main/view/incidentmap' component={InvestorMap}/>
                        <Route exact path='/app/main/admin/search' component={SearchAdmin}/>
                        <Route exact path='/app/main/admin/search/:id' component={SearchAdmin}/>
                        <Route exact path='/app/main/admin/map' component={Map}/>
                        <Route exact path='/app/main/admin/tickets' component={Tickets}/>
                        <Route exact path='/app/main/admin/registrations' component={Registrations}/>
                        <Route exact path='/app/main/admin/registrations/:id' component={Registrations}/>
                        <Route exact path='/app/main/admin/customers' component={Referrers}/>
                        <Route exact path='/app/main/admin/providers' component={OfficeAdminList}/>
                        <Route exact path='/app/main/admin/invoices' component={InvoiceAdminList}/>
                        <Route exact path='/app/main/admin/commissions' component={CommissionAdminList}/>
                        <Route exact path='/app/main/admin/demos' component={OnlineDemoList}/>
                        <Route exact path='/app/main/admin/coupons' component={CouponAdminList}/>
                        <Route exact path='/app/main/admin/plans' component={PricingList}/>
                        <Route exact path='/app/main/admin/users' component={UserAdminList}/>
                        <Route exact path="/app/main/office/locations"  component={OfficeAddresses} />
                        {/*<Route exact path="/app/main/office/chat" component={ChatOffice} />*/}
                        <Route exact path="/app/main/office/clients"  component={Customers} />
                        <Route exact path="/app/main/client/search" component={Search} />
                        <Route exact path="/app/main/client/chat" component={ChatUser} />
                        <Route exact path="/app/main/client/appointments" component={Appointments} />
                        <Route exact path="/app/main/client/appointments/:id" component={Appointments} />
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}

const mapStateToProps = store => ({
  currentUser: store.auth.currentUser
});

export default connect(mapStateToProps)(App);
