import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, Redirect } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Hammer from 'rc-hammerjs';

import Profile from '../../pages/profile';
import { SidebarTypes } from '../../reducers/layout';
import Header from '../Header';
import Sidebar from '../Sidebar';
import Helper from '../Helper';
import { openSidebar, closeSidebar, toggleSidebar } from '../../actions/navigation';
import s from './Layout.module.scss';
import { DashboardThemes } from '../../reducers/layout';
import BreadcrumbHistory from '../BreadcrumbHistory';

/* PAIN */
import { getVersion } from '../../version';
import Physician from '../../pain/physician/Physician';
import OfficeAdmin from '../../pain/admin/OfficeAdmin';
import Customers from '../../pain/office/Customers';
import Map from '../../pain/admin/Map';
import MyDay from '../../pain/myday/MyDay';
import MyHealth from '../../pain/myhealth/MyHealth';
import MyHealthDocuments from '../../pain/myhealth/MyHealthDocuments';
import MyHealthBilling from '../../pain/myhealth/MyHealthBilling';
import Search from '../../pain/search/Search';
import SearchAdmin from '../../pain/admin/SearchAdmin';
import Dashboard from '../../pain/dashboard/Dashboard';
import LegalAdmin from '../../pain/admin/LegalAdmin';
import PricingList from '../../pain/admin/PricingList';
import UserAdmin from '../../pain/admin/UserAdmin';
import InvoiceAdmin from '../../pain/admin/InvoiceAdmin';
import LegalAppointment from '../../pain/legal/LegalAppointment';
import LegalBilling from '../../pain/legal/LegalBilling';
import LegalSettings from '../../pain/legal/LegalSettings';
import OfficeInvoices from '../../pain/office/OfficeInvoices';
import OfficeAssociation from '../../pain/office/OfficeAssociation';
import Users from '../../pain/office/Users';
import Registrations from '../../pain/admin/Registrations';

class Layout extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dashboardTheme: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    sidebarStatic: false,
    sidebarOpened: false,
    dashboardTheme: DashboardThemes.DARK
  };
  constructor(props) {
    super(props);

    this.handleSwipe = this.handleSwipe.bind(this);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    if (window.innerWidth <= 768 && this.props.sidebarStatic) {
      this.props.dispatch(toggleSidebar());
    }
  }

  handleSwipe(e) {
    if ('ontouchstart' in window) {
      if (e.direction === 4) {
        this.props.dispatch(openSidebar());
        return;
      }

      if (e.direction === 2 && this.props.sidebarOpened) {
        this.props.dispatch(closeSidebar());
        return;
      }
    }
  }

  render() {
    return (
      <div
        className={[
          s.root,
          this.props.sidebarStatic ? `${s.sidebarStatic}` : '',
          !this.props.sidebarOpened ? s.sidebarClose : '',
          'sing-dashboard',
          `dashboard-${(localStorage.getItem("sidebarType") === SidebarTypes.TRANSPARENT) ? "light" : localStorage.getItem("dashboardTheme")}`,
          `header-${localStorage.getItem("navbarColor") ? localStorage.getItem("navbarColor").replace('#', '') : 'FFFFFF'}`
        ].join(' ')}
      >
        <Sidebar />
        <div className={s.wrap}>
          <Header />
          
          <Hammer onSwipe={this.handleSwipe}>
            <main className={s.content}>
            {/*<BreadcrumbHistory url={this.props.location.pathname} />*/}
              <TransitionGroup>
                <CSSTransition
                  key={this.props.location.key}
                  classNames="fade"
                  timeout={200}
                >
                  <Switch>
                    <Route path="/app/main" exact render={() => <Redirect to="/app/main/dashboard" />} />
                    <Route path="/app/main/dashboard" exact component={Dashboard} />
                    <Route path="/app/main/office/physicians" exact component={Physician} />
                    <Route path="/app/main/office/invoices" exact component={OfficeInvoices} />
                    <Route path="/app/main/office/users" exact component={Users} />
                    <Route path="/app/main/office/customers" exact component={Customers} />
                    <Route path="/app/main/office/associations" exact component={OfficeAssociation} />
                    <Route path="/app/main/admin/office" exact component={OfficeAdmin} />
                    <Route path="/app/main/admin/registrations" exact component={Registrations} />
                    <Route path="/app/main/admin/map" exact component={Map} />
                    <Route path="/app/main/admin/plans" exact component={PricingList} />
                    <Route path="/app/main/admin/legal" exact component={LegalAdmin} />
                    <Route path="/app/main/admin/search" exact component={SearchAdmin} />
                    <Route path="/app/main/admin/users" exact component={UserAdmin} />
                    <Route path="/app/main/admin/invoices" exact component={InvoiceAdmin} />
                    <Route path="/app/main/legal/myday" exact component={LegalAppointment} />
                    <Route path="/app/main/legal/settings" exact component={LegalSettings} />
                    <Route path="/app/main/legal/billing" exact component={LegalBilling} />
                    <Route path="/app/main/myday" exact component={MyDay} />
                    <Route path="/app/main/myhealth/appointments" exact component={MyHealth} />
                    <Route path="/app/main/myhealth/documents" exact component={MyHealthDocuments} />
                    <Route path="/app/main/myhealth/billing" exact component={MyHealthBilling} />
                    <Route path="/app/main/search" exact component={Search} />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
              <footer className={s.contentFooter}>
                <small>#PAIN - {getVersion()}</small>
              </footer>
            </main>
          </Hammer>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    dashboardTheme: store.layout.dashboardTheme,
    navbarColor: store.layout.navbarColor,
    sidebarType: store.layout.sidebarType,
    currentUser: store.auth.currentUser,
  };
}

export default withRouter(connect(mapStateToProps)(Layout));
