import React from 'react';
import PropTypes from 'prop-types';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MapIcon from '@mui/icons-material/Map';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import { connect } from 'react-redux';
import { Progress, Alert } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { dismissAlert } from '../../actions/alerts';
import s from './Sidebar.module.scss';
import LinksGroup from './LinksGroup/LinksGroup';
import { openSidebar, closeSidebar, changeActiveSidebarItem } from '../../actions/navigation';
import isScreen from '../../core/screenHelper';
import { logoutUser } from '../../actions/auth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Home from '../../images/sidebar/basil/Home';
import Globe from '../../images/sidebar/basil/Globe';
import User from '../../images/sidebar/basil/User';
import ShoppingCart from '../../images/sidebar/basil/ShoppingCart';
import Chat from '../../images/sidebar/basil/Chat';
import Stack from '../../images/sidebar/basil/Stack';
import Envelope from '../../images/sidebar/basil/Envelope';
import Document from '../../images/sidebar/basil/Document';
import Apps from '../../images/sidebar/basil/Apps';
import Asana from '../../images/sidebar/basil/Asana';
import Columns from '../../images/sidebar/basil/Columns';
import ChartPieAlt from '../../images/sidebar/basil/ChartPieAlt';
import Layout from '../../images/sidebar/basil/Layout';
import Rows from '../../images/sidebar/basil/Rows';
import Location from '../../images/sidebar/basil/Location';
import BusinessIcon from '@mui/icons-material/Business';
import Fire from '../../images/sidebar/basil/Fire';
import Menu from '../../images/sidebar/basil/Menu';
import ArticleIcon from '@mui/icons-material/Article';

class Sidebar extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    activeItem: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    sidebarStatic: false,
    sidebarOpened: false,
    activeItem: '',
  };

  constructor(props) {
    super(props);

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.doLogout = this.doLogout.bind(this);
  }

  onMouseEnter() {
    if (!this.props.sidebarStatic && (isScreen('lg') || isScreen('xl'))) {
      const paths = this.props.location.pathname.split('/');
      paths.pop();
      this.props.dispatch(openSidebar());
      this.props.dispatch(changeActiveSidebarItem(paths.join('/')));
    }
  }

  onMouseLeave() {
    if (!this.props.sidebarStatic && (isScreen('lg') || isScreen('xl'))) {
      this.props.dispatch(closeSidebar());
      this.props.dispatch(changeActiveSidebarItem(null));
    }
  }

  dismissAlert(id) {
    this.props.dispatch(dismissAlert(id));
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }

  render() {
    return (
      <div className={`${(!this.props.sidebarOpened && !this.props.sidebarStatic ) ? s.sidebarClose : ''} ${s.sidebarWrapper}`}>
      <nav
        onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}
        className={s.root}
      >
        <header className={s.logo}>
          <a href="/index.html"><span className={s.logoStyle}>#PAIN<span className={s.logoPart}></span></span> </a>
        </header>
        <ul className={s.nav}>
          <LinksGroup
            onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="Dashboard"
            isHeader
            iconName="flaticon-home"
            iconElement={<Home/>}
            link="/app/main/dashboard"
            index="main"
          />
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Legal")) && (
          <LinksGroup
            header="Customers"
            link="/app/main/legal/customers"
            isHeader
            iconElement={<Apps/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Legal")) && (
          <LinksGroup
            header="Invoices"
            link="/app/main/legal/billing"
            isHeader
            iconElement={<AccountBalanceIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Legal")) && (
          <LinksGroup
            header="Settings"
            link="/app/main/legal/settings"
            isHeader
            iconElement={<SettingsIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Customer")) && (
          <LinksGroup
            header="Appointments"
            link="/app/main/myhealth/appointments"
            isHeader
            iconElement={<CalendarMonthIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Customer")) && (
          <LinksGroup
            header="Chat"
            link="/app/main/myhealth/chat"
            isHeader
            iconElement={<ChatIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Customer")) && (
          <LinksGroup
            header="Documents"
            link="/app/main/myhealth/documents"
            isHeader
            iconElement={<ArticleIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Customer")) && (
          <LinksGroup
            header="Invoices"
            link="/app/main/myhealth/billing"
            isHeader
            iconElement={<AccountBalanceIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Admin")) && (
          <LinksGroup
            header="Map"
            link="/app/main/admin/map"
            isHeader
            iconElement={<MapIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Admin")) && (
          <LinksGroup
            header="Registrations"
            link="/app/main/admin/registrations"
            isHeader
            iconElement={<ConnectWithoutContactIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Customer")) && (
          <LinksGroup
            header="Search"
            link="/app/main/search"
            isHeader
            iconElement={<Location/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Physician")) && (
          <LinksGroup
            header="Chat"
            link="/app/main/office/chat"
            isHeader
            iconElement={<ChatIcon/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Physician")) && (
          <LinksGroup
            header="Customers"
            link="/app/main/customers"
            isHeader
            iconElement={<Apps/>}
            iconName="flaticon-users"
            labelColor="info"
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("OfficeAdmin")) && (
          <LinksGroup
            onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="Billing"
            iconElement={<AccountBalanceIcon/>}
            isHeader
            iconName="flaticon-document"
            link="/app/main/office/billing"
            index="billing"
            childrenLinks={[
              {
                header: 'Invoices', link: '/app/main/office/invoices',
              },
              {
                header: 'Payouts', link: '/app/main/office/payouts',
              },
            ]}
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("OfficeAdmin")) && (
          <LinksGroup
            onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="Settings"
            isHeader
            iconName="flaticon-settings"
            iconElement={<SettingsIcon/>}
            link="/app/main/settings"
            index="settings"
            childrenLinks={[
              {
                header: 'Physician', link: '/app/main/office/physicians',
              },
              {
                header: 'Associations', link: '/app/main/office/associations',
              },
              {
                header: 'Users', link: '/app/main/office/users',
              }
            ]}
          />
          )}
          {(this.props.currentUser && this.props.currentUser.entitlements && 
            this.props.currentUser.entitlements.includes("Admin")) && (
          <LinksGroup
            onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
            activeItem={this.props.activeItem}
            header="System"
            isHeader
            iconName="flaticon-settings"
            iconElement={<Stack/>}
            link="/app/main/system"
            index="system"
            childrenLinks={[
              {
                header: 'Providers', link: '/app/main/admin/office',
              },
              {
                header: 'Legal', link: '/app/main/admin/legal',
              },
              {
                header: 'Invoices', link: '/app/main/admin/invoices',
              },
              {
                header: 'Users', link: '/app/main/admin/users',
              },
            ]}
          />
          )}
        </ul>
      </nav >
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    currentUser: store.auth.currentUser,
    alertsList: store.alerts.alertsList,
    activeItem: store.navigation.activeItem,
    navbarType: store.navigation.navbarType,
    sidebarColor: store.layout.sidebarColor,
  };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
