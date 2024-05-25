import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getInvoiceAdmin } from '../../actions/invoiceAdmin';
import { invoiceAdminUpdate } from '../../actions/invoiceAdminUpdate';
import InvoiceAdminList from './InvoiceAdminList';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class InvoiceAdmin extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            filters:[
            ],
            filterSelected:{},
            page: 0,
            pageSize: 10
        }
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onStatusUpdate = this.onStatusUpdate.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.onSave = this.onSave.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (this.state.filters.length < 1 && p.invoiceAdmin && p.invoiceAdmin.data && 
            p.invoiceAdmin.data.config && p.invoiceAdmin.data.config.status) { 
            this.state.filterSelected = {
                label:p.invoiceAdmin.data.config.status[0].name,
                id:p.invoiceAdmin.data.config.status[0].id
            }
            this.state.filters = p.invoiceAdmin.data.config.status.map((e) => { 
                return (
                    {label:e.name,value:e.id}
                )
            })
        } 
    }

    onStatusUpdate(e) { 
        this.props.dispatch(invoiceAdminStatus(e)).then(() => { 
            this.props.dispatch(getInvoiceAdmin({
                filter:this.state.filterSelected.value,page:this.state.page,limit:this.state.pageSize}
            ))
        })
    } 
    onSave(e) { 
        var params = {
            id: e.id,
            comments: e.comments,
            invoice_status_id: e.invoice_status_id
        }
        this.props.dispatch(invoiceAdminUpdate(params,function(err,args) { 
            args.props.dispatch(getInvoiceAdmin(
                {
                    filter:args.state.filterSelected.value,page:args.state.page,limit:args.state.pageSize
                },function(err,args) { 
                toast.success('Successfully scheduled invoice.',
                    {
                        position:"top-right",
                        autoClose:3000,
                        hideProgressBar:true
                    }
                );
            },args))
        },this));
    } 

    pageChange(e,t) { 
        if (e === '>') { 
            this.state.page = this.state.page + 1;
        } else { 
            this.state.page = e - 1;
        }
        this.props.dispatch(getInvoiceAdmin(
            {limit:this.state.pageSize,offset:this.state.page,status:t}
        ));
        this.setState(this.state);
    } 

    onFilterChange(e) { 
        this.props.dispatch(getInvoiceAdmin({filter:e.value,page:this.state.page,limit:this.state.pageSize}))
        this.state.filterSelected = e
        this.setState(this.state)
    } 

    componentDidMount() {
        this.props.dispatch(getInvoiceAdmin({page:this.state.page,limit:this.state.pageSize}))
    }

    render() {
        return (
        <>
            {(this.props.invoiceAdminUpdate && this.props.invoiceAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.invoiceAdmin && this.props.invoiceAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            <Grid md="12">
                <Grid item  md="12">
                    <InvoiceAdminList filters={this.state.filters} page={this.state.page} filterSelected={this.state.filterSelected} 
                        pageChange={this.pageChange} onFilterChange={this.onFilterChange} 
                        onSave={this.onSave} onStatusUpdate={this.onStatusUpdate}/>
                </Grid>                
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        invoiceAdminUpdate: store.invoiceAdmin,
        invoiceAdmin: store.invoiceAdmin
    }
}

export default connect(mapStateToProps)(InvoiceAdmin);
