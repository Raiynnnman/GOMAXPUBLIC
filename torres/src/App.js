import React from 'react';
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
import Dashboard from './pain/dashboard/Dashboard';
import RegisterProvider from './pain/landing/RegisterProvider';
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

import Pricing from './components/Pricing';
const CloseButton = ({closeToast}) => <i onClick={closeToast} className="la la-close notifications-close"/>
const App = () => {
    if (window.location.hash.startsWith('#/')) {
        window.location = window.location.hash.replace('#', '')
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
                    <Route exact path='/' component={HomeHorizontal}/>
                    <Route exact path='/login' component={Login}/>
                    <Route exact path='/register' component={Register}/>
                    <Route exact path='/search' component={Search}/>
                    <Route exact path='/demo' component={Landing}/>
                    <Route exact path='/forgot' component={Forgot}/>
                    <Route exact path='/reset/:token' component={Reset}/>
                    <Route exact path='/register-provider' component={RegisterProvider}/>
                    <Route exact path='/welcome' component={Welcome}/>
                    <Route exact path='/register-provider/:id' component={RegisterProvider}/>
                    <Route exact path='/register-legal' component={RegisterLegal}/>
                    <Route exact path='/register-legal/:id' component={RegisterLegal}/>
                    <Route path="/app" exact render={() => <Redirect to="/app/main"/>}/>
                    <Route path="/app/main" exact render={() => <Redirect to="/app/main/dashboard"/>}/>
                    <Route exact path='/app/main/dashboard' component={Dashboard}/>
                    <Route exact path='/app/main/admin/search' component={SearchAdmin}/>
                    <Route exact path='/app/main/admin/map' component={Map}/>
                    <Route exact path='/app/main/admin/registrations' component={Registrations}/>
                    <Route exact path='/app/main/admin/referrals' component={Referrers}/>
                    <Route exact path='/app/main/admin/providers' component={OfficeAdminList}/>
                    <Route exact path='/app/main/admin/invoices' component={InvoiceAdminList}/>
                    <Route exact path='/app/main/admin/commissions' component={CommissionAdminList}/>
                    <Route exact path='/app/main/admin/coupons' component={CouponAdminList}/>
                    <Route exact path='/app/main/admin/plans' component={PricingList}/>
                    <Route exact path='/app/main/admin/users' component={UserAdminList}/>
                    <Route exact path="/app/main/office/locations"  component={OfficeAddresses} />
                    <Route exact path="/app/main/office/clients"  component={Customers} />
                    <Route exact path="/app/main/office/locations" exact component={OfficeAddresses} />
                    <Route exact path="/app/main/office/clients" exact component={Customers} />
                    <Route exact path="/app/main/client/search" exact component={Search} />
                    <Route exact path="/app/main/client/appointments" exact component={Appointments} />
                    <Route exact path={`${process.env.PUBLIC_URL}/tf`} component={DemoTF}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/home-one`} component={HomeOlive}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/home-two`} component={HomeHorizontal}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/blog-grid`} component={BlogGrid}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/blog-two-column`} component={BlogTwoColumn}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/blog-details`} component={BlogDetails}/>
                </Switch>
            </BrowserRouter>
        </div>
    );
}

const mapStateToProps = store => ({
  currentUser: store.auth
});

export default connect(mapStateToProps)(App);
