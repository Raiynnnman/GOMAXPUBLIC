# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import AdminRest

admin = Blueprint('admin', __name__)

@admin.route('/admin/office/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def officelist(*args, **kwargs):
    po = AdminRest.OfficeListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/office/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_update.yaml')
def officesave(*args, **kwargs):
    po = AdminRest.OfficeSaveRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/context/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'context.yaml')
def getcontext(*args, **kwargs):
    po = AdminRest.GetContextRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/context/delete', methods=['POST'])
@token_required
@swag_from(docs_dir + 'delcontext.yaml')
def delcontext(*args, **kwargs):
    po = AdminRest.DelContextRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/bdr/dashboard', methods=['GET'])
@token_required
@swag_from(docs_dir + 'admin_dashboard.yaml')
def bdrdash(*args, **kwargs):
    po = AdminRest.BDRDashboardRest()
    return po.getWrapper(*args,**kwargs)

@admin.route('/admin/dashboard', methods=['GET'])
@token_required
@swag_from(docs_dir + 'admin_dashboard.yaml')
def admindash(*args, **kwargs):
    po = AdminRest.AdminDashboard()
    return po.getWrapper(*args,**kwargs)

@admin.route('/admin/bundle/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_bundle_list.yaml')
def bundlelist(*args, **kwargs):
    po = AdminRest.BundleListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/bundle/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_bundle_update.yaml')
def bundleupdate(*args, **kwargs):
    po = AdminRest.BundleUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/legal/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_legal_list.yaml')
def conslist(*args, **kwargs):
    po = AdminRest.LegalListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/legal/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_legal_update.yaml')
def consupdate(*args, **kwargs):
    po = AdminRest.LegalUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/users/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_users_list.yaml')
def userslist(*args, **kwargs):
    po = AdminRest.UserListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/users/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_users_update.yaml')
def userupdate(*args, **kwargs):
    po = AdminRest.UserUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/invoices/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_invoices_list.yaml')
def invocieslist(*args, **kwargs):
    po = AdminRest.InvoicesListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/invoice/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_invoices_update.yaml')
def invociesupdate(*args, **kwargs):
    po = AdminRest.InvoicesUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/transfers/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_transfers_list.yaml')
def transferslist(*args, **kwargs):
    po = AdminRest.TransfersListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/corporations/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_corporation_list.yaml')
def corporationlist(*args, **kwargs):
    po = AdminRest.CorporationListRest()
    return po.postWrapper(*args,**kwargs)


@admin.route('/admin/corporations/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_corporation_update.yaml')
def corporationupdate(*args, **kwargs):
    po = AdminRest.CorporationUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/registrations/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def reglist(*args, **kwargs):
    po = AdminRest.RegistrationListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/registrations/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def regupdate(*args, **kwargs):
    po = AdminRest.RegistrationUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/tickets/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'ticketslist.yaml')
def ticketlist(*args, **kwargs):
    po = AdminRest.TicketListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/tickets/create', methods=['POST'])
@token_required
@swag_from(docs_dir + 'ticketslist.yaml')
def ticketcreate(*args, **kwargs):
    po = AdminRest.TicketCreateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/tickets/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'ticketslist.yaml')
def ticketupdate(*args, **kwargs):
    po = AdminRest.TicketUpdateRest()
    return po.postWrapper(*args,**kwargs)
 
@admin.route('/admin/traffic/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def trafficlist(*args, **kwargs):
    po = AdminRest.TrafficGetRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/plans/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def planslist(*args, **kwargs):
    po = AdminRest.PlansGetRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/plans/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def plansupdate(*args, **kwargs):
    po = AdminRest.PlansUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/report/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def reportget(*args, **kwargs):
    po = AdminRest.AdminReportGetRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/booking/register', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def searchreg(*args, **kwargs):
    po = AdminRest.AdminBookingRegisterRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/referral/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def refupdate(*args, **kwargs):
    po = AdminRest.ReferrerUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/referrer/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def reflist(*args, **kwargs):
    po = AdminRest.ReferrerListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/commission/user/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def commissionuserlist(*args, **kwargs):
    po = AdminRest.CommissionUserListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/commission/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def commissionlist(*args, **kwargs):
    po = AdminRest.CommissionListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/coupon/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def couponlist(*args, **kwargs):
    po = AdminRest.CouponListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/coupon/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def couponupdate(*args, **kwargs):
    po = AdminRest.CouponUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/customers/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def customerslist(*args, **kwargs):
    po = AdminRest.CustomersListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/customers/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def customersupdate(*args, **kwargs):
    po = AdminRest.CustomersUpdateRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/demo/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def onlinedemosave(*args, **kwargs):
    po = AdminRest.OnlineDemoSaveRest()
    return po.postWrapper(*args,**kwargs)


@admin.route('/admin/demo/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def onlinedemolist(*args, **kwargs):
    po = AdminRest.OnlineDemoListRest()
    return po.postWrapper(*args,**kwargs)

@admin.route('/admin/notifications/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def notificationslist(*args, **kwargs):
    po = AdminRest.NotificationsListRest()
    return po.postWrapper(*args,**kwargs)
