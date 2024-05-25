import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { FormGroup, Label, Input } from 'reactstrap';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import moment from 'moment';
import Select from 'react-select';
import { push } from 'connected-react-router';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { searchRegister } from '../../actions/searchRegister';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Button } from 'reactstrap'; 
import { Badge } from 'reactstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getContext } from '../../actions/context';
import { getUserAdmin } from '../../actions/userAdmin';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import EditIcon from '@mui/icons-material/Edit';
import PhysicianCard from '../search/PhysicianCard';
import AliceCarousel from 'react-alice-carousel';
import { searchCheckRes } from '../../actions/searchCheckRes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { SearchBar } = Search;
class UserAdminList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selected: null,
            assignPhysician: null,
            page: 0,
            pageSize: 10,
            commentAdd:false
        } 
        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.pageChange = this.pageChange.bind(this);
        this.renderTotalLabel = this.renderTotalLabel.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.zipcodeChange = this.zipcodeChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.addr1Change = this.addr1Change.bind(this);
        this.addr2Change = this.addr2Change.bind(this);
        this.cityChange = this.cityChange.bind(this);
        this.stateChange = this.stateChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getUserAdmin({page:this.state.page,limit:this.state.pageSize}))
    }

    addr1Change(e) {
        this.state.selected.addr1 = e.target.value;
        this.setState(this.state);
    }
    addr2Change(e) {
        this.state.selected.addr2 = e.target.value;
        this.setState(this.state);
    }
    cityChange(e) {
        this.state.selected.city = e.target.value;
        this.setState(this.state);
    }
    stateChange(e) {
        this.state.selected.state = e.target.value;
        this.setState(this.state);
    }

    cancel() { 
        this.state.selected = null;
        this.setState(this.state);
    } 
    zipcodeChange(e) { 
        this.state.selected['zipcode'] = e.target.value;
        this.setState(this.state);
    } 
    emailChange(e) { 
        this.state.selected['email'] = e.target.value;
        this.setState(this.state);
    } 
    pageChange(e,t) { 
        if (e === '>') { 
            this.state.page = this.state.page + 1;
        } else { 
            this.state.page = e - 1;
        }
        this.props.dispatch(getUserAdmin(
            {limit:this.state.pageSize,offset:this.state.page,status:this.state.filter}
        ));
        this.setState(this.state);
    } 

    renderTotalLabel(f,t,s) { 
        var numpage = s/t;
        return "Showing page " + (this.state.page+1) + " of " + numpage.toFixed(0);
    } 
    firstChange(e) { 
        this.state.selected['first_name'] = e.target.value;
        this.setState(this.state);
    } 
    lastChange(e) { 
        this.state.selected['last_name'] = e.target.value;
        this.setState(this.state);
    } 
    phoneChange(e) { 
        this.state.selected['phone'] = e.target.value;
        this.setState(this.state);
    } 

    edit(row) { 
        var r = {}
        if (row.id === 'new') { 
            r = { 
                email:'',
                phone:'',
                addr1:'',
                addr2:'',
                city:'',
                state:'',
                zipcode:'',
                first_name:'',
                last_name:''
            }
        } else { 
            r = row
        } 
        this.state.selected=r
        this.setState(this.state);
    } 
    save() { 
        this.props.onSave(this.state.selected);
        this.state.selected = null;
        this.setState(this.state);
    } 

    render() {
        const pageButtonRenderer = ({
          page,
          currentPage,
          disabled,
          title,
          onPageChange
        }) => {
          const handleClick = (e) => {
             e.preventDefault();
             this.pageChange(page, currentPage);// api call 
           };    
          return (
            <div>
              {
               <li className="page-item">
                 <a href="#"  onClick={ handleClick } className="page-link">{ page }</a>
               </li>
              }
            </div>
          );
        };
        const options = {
          pageButtonRenderer,
          showTotal:true,
          withFirstAndLast: false,
          alwaysShowAllBtns: false,
          nextPageText:'>',
          sizePerPage:10,
          paginationTotalRenderer: (f,t,z) => this.renderTotalLabel(f,t,z),
          totalSize: (this.props.userAdmin && 
                      this.props.userAdmin.data &&
                      this.props.userAdmin.data.total) ? this.props.userAdmin.data.total : 10,
          hideSizePerPage:true,
          //onPageChange:(page,sizePerPage) => this.pageChange(page,sizePerPage)
        };
        const responsive = {
            0: { 
                items: 1
            },
            568: { 
                items: 1
            },
            1024: {
                items: 1, 
                itemsFit: 'contain'
            },
        };
        var heads = [
            {
                dataField:'id',
                sort:true,
                hidden:true,
                text:'ID'
            },
            {
                dataField:'first_name',
                editable: false,
                text:'Name',
                formatter:(cellContent,row) => (
                    <div>
                        {row.first_name + " " + row.last_name}
                    </div>
                )
            },
            {
                dataField:'email',
                editable: false,
                text:'Email',
            },
            {
                dataField:'phone',
                editable: false,
                text:'Phone',
            },
            {
                dataField:'active',
                editable: false,
                text:'Active',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.active === 1) && (<Badge color="primary">Active</Badge>)}
                        {(row.active === 0) && (<Badge color="danger">Inactive</Badge>)}
                    </div>
                )
            },
            {
                dataField:'id',
                editable: false,
                text:'Roles',
                formatter: (cellContent,row) => (
                    <div>
                        {(row.entitlements.filter((e) => e.name === 'Admin').length > 0) && (<Badge color="danger">Admin</Badge>)}
                        {(row.entitlements.filter((e) => e.name === 'Provider').length > 0)&& (<Badge color="warning">Provider</Badge>)}
                        {(row.entitlements.filter((e) => e.name === 'Legal').length > 0)&& (<Badge color="info">Legal</Badge>)}
                        {(row.entitlements.filter((e) => e.name === 'Customer').length > 0) && (<Badge color="primary">Customer</Badge>)}
                    </div>
                )
            },
            {
                dataField:'updated',
                sort:true,
                editable: false,
                text:'Updated',
                formatter:(cellContent,row) => (
                    <div>
                        {moment(row['updated']).isValid() ?  
                         moment(row['updated']).format('LLL') : moment(row['updated2']).format('LLL')}
                    </div>
                )
            },
            {
                dataField:'id',
                text:'Actions',
                editable: false,
                formatter:(cellContent,row) => ( 
                    <div>
                        {/*<Button onClick={() => this.edit(row)} style={{marginRight:5,height:35}} color="primary"><EditIcon/></Button>*/}
                    </div>
                )
            },
        ];
        return (
        <>
            {(this.props.userAdmin && this.props.userAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props && this.props.userAdmin && this.props.userAdmin.data && 
              this.props.userAdmin.data.users && this.state.selected === null) && ( 
            <>
            <Grid container xs="12">
                <Grid item xs="2" style={{marginBottom:10}}>
                    {/*<Button onClick={() => this.edit({id:"new"})} 
                        style={{marginRight:5,height:35,width:90}} color="primary">Add</Button>
                    */}
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="12">
                      <BootstrapTable 
                          keyField="id"
                          data={ this.props.userAdmin.data.users }
                          columns={ heads }
                          pagination={ paginationFactory(options) }>
                      </BootstrapTable>
                </Grid>                
            </Grid>
            </>
            )}
            {(this.props && this.props.userAdmin && this.props.userAdmin.data && 
              this.props.userAdmin.data.users && this.state.selected !== null) && ( 
            <>
            <Grid container xs="12">
                <Grid item xs="5">
                    <h5>Details</h5>
                </Grid>
            </Grid>
            <Grid container xs="12">
                <Grid item xs="5">
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Email
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.emailChange} placeholder="Email" value={this.state.selected.email}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              First Name
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.firstChange} placeholder="First Name" value={this.state.selected.first_name}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Last Name
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.lastChange} placeholder="Last Name" value={this.state.selected.last_name}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Phone
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.phoneChange} placeholder="Phone" value={this.state.selected.phone}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Address1
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.addr1Change} placeholder="Address 1" value={this.state.selected.addr1}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Address2
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.addr2Change} placeholder="Address 1" value={this.state.selected.addr2}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              City
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.cityChange} placeholder="Address 1" value={this.state.selected.city}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              State
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.stateChange} placeholder="Address 1" value={this.state.selected.state}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container xs="12">
                        <Grid item xs="12">
                          <FormGroup row>
                            <Label for="normal-field" md={4} className="text-md-right">
                              Zipcode
                            </Label>
                            <Grid item xs={7}>
                              <Input type="text" id="normal-field" onChange={this.zipcodeChange} placeholder="Zip" value={this.state.selected.zipcode}/>
                            </Grid>
                          </FormGroup>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <hr/>
            <Grid container xs="12">
                {(!this.state.commentAdd) && (
                <Grid item xs="6">
                    <Button onClick={this.save} color="primary">Save</Button>
                    <Button outline style={{marginLeft:10}} onClick={this.cancel} color="secondary">Cancel</Button>
                </Grid>
                )}
            </Grid>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        userAdmin: store.userAdmin
    }
}

export default connect(mapStateToProps)(UserAdminList);
