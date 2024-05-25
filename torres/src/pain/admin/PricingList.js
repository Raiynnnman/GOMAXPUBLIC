import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getPlansList } from '../../actions/plansList';
import baseURLConfig from '../../baseURLConfig';

class PricingList extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected: null,
            activeTab: "pricing",
        }
        this.toggleTab = this.toggleTab.bind(this);
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getPlansList({page:0,limit:10000}))
    }

    render() {
        var planheads = [
            {
                dataField:'id',
                sort:true,
                text:'ID',
                formatter:(cellContent,row) => (
                    <div>
                        <a target='_blank' href={baseURLConfig() + '/#/register-provider/' + row.id}>{row.id}</a>
                    </div>
                )
            },
            {
                dataField:'description',
                text:'Description'
            },
            {
                dataField:'start_date',
                text:'Start'
            },
            {
                dataField:'end_date',
                text:'End'
            },
            {
                dataField:'duration',
                text:'Duration'
            },
            {
                dataField:'slot',
                text:'Slot'
            },
            {
                dataField:'price',
                text:'Price'
            }
        ]
        const options = {
          showTotal:true,
          sizePerPage:10,
          hideSizePerPage:true
        };
        return (
        <>
            {(this.props.plansList && this.props.plansList.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'pricing' })}
                                onClick={() => { this.toggleTab('pricing') }}>
                                <span>{translate('Pricing')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        {(this.props.plansList && this.props.plansList.data && 
                          this.props.plansList.data.length > 0)&& ( 
                        <TabPane tabId="pricing">
                            <BootstrapTable 
                                keyField='id' data={this.props.plansList.data} 
                                pagination={paginationFactory(options)}
                                columns={planheads}>
                            </BootstrapTable>
                        </TabPane>
                        )}
                    </TabContent>
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        plansList: store.plansList
    }
}

export default connect(mapStateToProps)(PricingList);
