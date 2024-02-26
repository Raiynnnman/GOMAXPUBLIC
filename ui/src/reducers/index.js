import { combineReducers } from 'redux';
import auth from './auth';
import review from './review';
import registrationsAdminList from './registrationsAdminList';
import trafficData from './trafficGet';
import registration from './registration';
import registerVerify from './registerVerify';
import landingData from './landingData';
import myDayApptSave from './mydayApptSave';
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
import officeBillingDownloadDoc from './officeBillingDownloadDoc.js';
import moreSchedules from './moreSchedules';
import userDashboard from './userDashboard';
import navigation from './navigation';
import officeInvoices from './officeInvoices';
import alerts from './alerts';
import invoiceAdmin from './invoiceAdmin';
import layout from './layout';
import chat from './chat';
import offices from './offices';
import legal from './legal';
import bundles from './bundles';
import setupIntent from './setupIntent';
import bundleSave from './bundleSave';
import officeSave from './officeSave';
import userDocumentsUpdate from './userDocumentsUpdate';
import phy from './phy';
import procedures from './procedures';
import searchRegister from './searchRegister';
import proceduresSearch from './proceduresSearch';
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
import bundleAdmin from './bundleAdmin';
import bundleAdminUpdate from './bundleAdminUpdate';
import userAdmin from './userAdmin';
import legalAdmin from './legalAdmin';
import legalAdminUpdate from './legalAdminUpdate';
import legalBilling from './legalBilling';
import legalBillingDownloadDoc from './legalBillingDownloadDoc';
import saveCard from './saveCard';
import legalDashboard from './legalDashboard';
import { connectRouter } from 'connected-react-router';
import chatUser from './chatUser';
import chatOffice from './chatOffice';
import mydayGetOfficePatients from './mydayGetOfficePatients';
import mydayCustomAppt from './mydayCustomAppt'; 
import registerProvider from './registerProvider';

export default (history) =>
  combineReducers({
    router: connectRouter(history),
    adminDashboard,
    chatDownloadDoc,
    registerProvider,
    alerts,
    createRoom,
    auth,
    chatUser,
    chatOffice,
    transfers,
    bundleAdmin,
    bundleAdminUpdate,
    bundleSave,
    bundles,
    legalAdmin,
    legalAdminUpdate,
    legalBilling,
    legalBillingDownloadDoc,
    legalDashboard,
    legalSchedSave,
    legal,
    context,
    invoiceAdmin,
    invoiceAdminUpdate,
    layout,
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
    proceduresSearch,
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
    registration,
    corporationUsersSave,
    review,
    registrationsAdminList,
    registerVerify,
    userDashboard,
    userDefaultCard,
    landingData,
    trafficData,
    mydayReceiptSave,
    userDocumentsUpdate,
    chat,
});
