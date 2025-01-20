import { combineReducers } from 'redux';
import dataScienceQueries from './dataScienceQueries';
import support from './support';
import profileSave from './profileSave';
import profileList from './profileList';
import plansListUpdate from './plansListUpdate';
import supportSave from './supportSave';
import adminNotifications from './adminNotifications';
import dataScienceDataset from './dataScienceDataset';
import referralAdminUpdate from './referralAdminUpdate';
import dataScienceResults from './dataScienceResults';
import dataScienceDatasetRun from './dataScienceDatasetRun';
import dataScienceJobs from './dataScienceJobs';
import dataScienceMetadata from './dataScienceMetadata';
import dataScienceQueriesUpdate from './dataScienceQueriesUpdate';
import auth from './auth';
import patientRegister from './patientRegister';
import calendarBackendBooking from './calendarBackendBooking';
import demoStart from './demoStart';
import onlineDemoTraffic from './onlineDemoTraffic';
import onlineDemo from './onlineDemo';
import onlineDemoSave from './onlineDemoSave';
import contactus from './contactus';
import appointments from './appointments';
import subscribe from './subscribe';
import referralResponse from './referralResponse';
import customersSave from './customersSave';
import officeLocations from './officeLocations';
import customers from './customers';
import officeLocationsSave from './officeLocationsSave';
import couponSave from './couponSave';
import bdrDashboard from './bdrDashboard';
import coupons from './coupons';
import referrerDashboard from './referrerDashboard';
import commissions from './commissions';
import commissionsUser from './commissionsUser';
import registrationReport from './registrationReport';
import registerReferrer from './registerReferrer';
import referrerUpload from './referrerUpload';
import referrerAdminList from './referrerAdminList';
import registrationAdminUpdate from './registrationAdminUpdate';
import officeClients from './officeClients';
import officeClientUpdate from './officeClientUpdate';
import searchProvider from './searchProvider';
import searchRegisterAdmin from './searchRegisterAdmin';
import officeReportDownload from './officeReportDownload';
import plansList from './plansList';
import searchConfig from './searchConfig';
import review from './review';
import registrationsAdminList from './registrationsAdminList';
import trafficData from './trafficGet';
import registerUser from './registerUser';
import registerVerify from './registerVerify';
import landingData from './landingData';
import mydayReceiptSave from './mydayReceiptSave';
import corporationUsers from './corporationUsers';
import corporationAdmin from './corporationAdmin';
import corporationUsersSave from './corporationUsersSave';
import corporationAdminSave from './corporationAdminSave';
import delContext from './delContext';
import cptSearch from './cptSearch';
import cmSearch from './cmSearch';
import officeAssociation from './officeAssociation';
import officeAssociationUpdate from './officeAssociationUpdate';
import createRoom from './createRoom';
import chatUploadDoc from './chatUploadDoc';
import chatDownloadDoc from './chatDownloadDoc';
import transfers from './transfers';
import legalSchedSave from './legalSchedSave';
import userDefaultCard from './userDefaultCard';
import officeUsersSave from './officeUsersSave';
import officeUsers from './officeUsers';
import transferAdmin from './transferAdmin';
import invoiceAdminUpdate from './invoiceAdminUpdate';
import officeBillingDownloadDoc from './officeBillingDownloadDoc';
import moreSchedules from './moreSchedules';
import userDashboard from './userDashboard';
import navigation from './navigation';
import officeInvoices from './officeInvoices';
import alerts from './alerts';
import invoiceAdmin from './invoiceAdmin';
import chat from './chat';
import offices from './offices';
import legal from './legal';
import setupIntent from './setupIntent';
import officeSave from './officeSave';
import userDocumentsUpdate from './userDocumentsUpdate';
import phy from './phy';
import procedures from './procedures';
import searchRegister from './searchRegister';
import providerSearch from './providerSearch';
import providerSearchAdmin from './providerSearchAdmin';
import phySave from './phySave';
import myday from './myday';
import mydaySchedSave from './mydaySchedSave';
import searchCheckRes from './searchCheckRes';
import context from './context';
import user from './user';
import leads from './leads';
import leadsSave from './leadsSave';
import adminDashboard from './adminDashboard';
import mydayApptSave from './mydayApptSave';
import mydayApproveInvoice from './mydayApproveInvoice';
import userAdmin from './userAdmin';
import legalAdmin from './legalAdmin';
import legalAdminUpdate from './legalAdminUpdate';
import legalBilling from './legalBilling';
import legalBillingDownloadDoc from './legalBillingDownloadDoc';
import saveCard from './saveCard';
import providerDashboard from './providerDashboard';
import chatUser from './chatUser';
import chatOffice from './chatOffice';
import mydayGetOfficePatients from './mydayGetOfficePatients';
import mydayCustomAppt from './mydayCustomAppt'; 
import registerProvider from './registerProvider';
import ticketsReducer from './ticketsUpsert';

export default combineReducers({
    // router: connectRouter(history),
    adminDashboard,
    chatDownloadDoc,
    registerProvider,
    providerSearchAdmin,
    alerts,
    createRoom,
    auth,
    chatUser,
    chatOffice,
    transfers,
    legalAdmin,
    legalAdminUpdate,
    legalBilling,
    legalBillingDownloadDoc,
    providerDashboard,
    legalSchedSave,
    legal,
    context,
    invoiceAdmin,
    invoiceAdminUpdate,
    // layout,
    leads,
    leadsSave,
    moreSchedules,
    myday,
    mydayApproveInvoice,
    mydaySchedSave,
    mydayGetOfficePatients,
    mydayCustomAppt,
    navigation,
    officeBillingDownloadDoc,
    officeInvoices,
    officeSave,
    officeUsers,
    officeUsersSave,
    offices,
    phy,
    phySave,
    procedures,
    providerSearch,
    saveCard,
    searchCheckRes,
    searchRegister,
    setupIntent,
    chatUploadDoc,
    transferAdmin,
    user,
    cptSearch,
    cmSearch,
    delContext,
    userAdmin,
    officeAssociation,
    officeAssociationUpdate,
    corporationAdmin,
    corporationAdminSave,
    corporationUsers,
    mydayApptSave,
    registerUser,
    corporationUsersSave,
    review,
    registrationsAdminList,
    plansList,
    registerVerify,
    userDashboard,
    userDefaultCard,
    officeClientUpdate,
    landingData,
    trafficData,
    registrationAdminUpdate,
    searchRegisterAdmin,
    searchProvider,
    searchConfig,
    commissions,
    registrationReport,
    referrerDashboard,
    referrerAdminList,
    officeReportDownload,
    officeClients,
    mydayReceiptSave,
    coupons,
    bdrDashboard,
    officeLocations,
    officeLocationsSave,
    commissionsUser,
    couponSave,
    customers,
    customersSave,
    referralResponse,
    contactus,
    subscribe,
    referrerUpload,
    appointments,
    registerReferrer,
    userDocumentsUpdate,
    chat,
    demoStart,
    calendarBackendBooking,
    onlineDemo,
    patientRegister,
    onlineDemoTraffic,
    dataScienceQueries,
    dataScienceQueriesUpdate,
    dataScienceJobs,
    dataScienceMetadata,
    referralAdminUpdate,
    dataScienceDataset,
    adminNotifications,
    support,
    supportSave,
    plansListUpdate,
    profileSave,
    dataScienceResults,
    profileList,
    dataScienceDatasetRun,
    onlineDemoSave,
    ticketsReducer
});
