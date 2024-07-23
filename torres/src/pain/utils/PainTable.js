import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
  Grid,
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage as LastPageIcon,
} from '@mui/icons-material';
import cx from 'classnames';
import translate from '../utils/translate';

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };


  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

class PainTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
        selected:[],
        selectedRowIDs:[],
        allSelected:false
    };
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.handleChangeSort = this.handleChangeSort.bind(this);
    this.handleChangeGridsPerPage = this.handleChangeGridsPerPage.bind(this);
  }

  componentWillReceiveProps(p) {
  }

  componentDidMount() {
  }

  onSelectRow(e) { 
    if (this.state.selected.includes(e.id)) { 
        this.state.selected = this.state.selected.filter((f) => f.id !== e.id)
        this.state.selectedRowIDs = this.state.selectedRowIDs.filter((f) => f !== e.id)
    } else { 
        this.state.selected.push(e)
        this.state.selectedRowIDs.push(e.id)
    } 
    this.setState(this.state)
    this.props.onMassChange(this.state.selected);
  } 

  onSelectAll(e) { 
    var c = 0; 
    if (this.state.selected.length > 0) { 
        this.state.selected = []
        this.state.selectedRowIDs = []
        this.state.allSelected = false;
        this.props.onMassChange([]);
        this.setState(this.state)
    } else { 
        this.state.allSelected = true;
        for (c = 0;c < this.props.data.length; c++) { 
            this.onSelectRow(this.props.data[c])
        } 
        this.setState(this.state)
    }
  } 

  handleClick(e,r) { 
    if (r.onClick) { 
        r.onClick(e,r)
    }
  } 
  handleChangeSort(e, t) {
    this.props.onSort(e);
  }

  handleChangePage(e, t) {
    this.props.onPageChange(t);
  }

  handleChangeGridsPerPage(e, t) {
    var v = t.key;
    v = v.replace('$', '');
    v = v.replace('.', '');
    this.props.onPageGridsPerPageChange(v);
  }

  render() {
    return (
      <>
        <Grid container style={{marginTop:0}}>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: this.props.minWidth? this.props.minWidth : 650 }} size="small" aria-label="">
                <TableHead>
                  <TableRow>
                    {this.props.selectAll && (
                    <TableCell style={{backgroundColor:'#fa6a0a'}} padding="checkbox">
                      <Checkbox
                        style={{ color: 'white' }}
                        checked={this.allSelected}
                        onChange={this.onSelectAll}
                        inputProps={{
                          'aria-label': 'select all desserts',
                        }}
                      />
                    </TableCell>
                    )}
                    {this.props.columns.map((e) => {
                      if (!e.hidden) {
                        return (
                          <TableCell
                            key={e.dataField}
                            align={e.align}
                            style={{ width:e.width, 
                                backgroundColor: this.props.headerBackgroundColor ? this.props.headerBackgroundColor : '#fa6a0a', 
                                color : this.props.headerColor ? this.props.headerColor : '#fa6a0a', 
                                }}
                          >
                            {!e.sort && e.text}
                            {e.sort && (
                              <TableSortLabel
                                active={e.sort}
                                direction={e.direction}
                                onClick={() => this.handleChangeSort(e)}
                              >
                                {e.text}
                              </TableSortLabel>
                            )}
                          </TableCell>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.props.data.map((row) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {this.props.selectAll && (
                        <TableCell style={{backgroundColor:'#fa6a0a'}} padding="checkbox">
                          <Checkbox
                            style={{ color: 'white' }}
                            checked={this.state.selectedRowIDs.includes(row.id)}
                            onChange={() => this.onSelectRow(row)}
                            inputProps={{
                              'aria-label': 'select all desserts',
                            }}
                          />
                        </TableCell>
                        )}
                      {this.props.columns.map((e) => {
                        if (!e.hidden) {
                          return (
                            <TableCell key={e.dataField} 
                                    style={{
                                        color:this.props.dataColor ? this.props.dataColor : "black",
                                        backgroundColor:this.props.dataBackgroundColor ? this.props.dataBackgroundColor : "white"
                                    }}
                                align={e.align} onClick={() => this.handleClick(row,e)}>
                              <font style={{
                                    color:this.props.dataColor ? this.props.dataColor : "black",
                                    backgroundColor:this.props.dataBackgroundColor ? this.props.dataBackgroundColor : "white",
                                    cursor:e.onClick ? "pointer":null}}>
                                {e.formatter ? e.formatter(e, row) : row[e.dataField]}
                              </font>
                            </TableCell>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </TableRow>
                  ))}
                </TableBody>
                {(!this.props.noPaging) && (
                <TableFooter>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100, 250]}
                    count={this.props.total || this.props.data.length}
                    rowsPerPage={this.props.pageSize || 10}
                    page={this.props.page || 0}
                    onPageChange={this.handleChangePage}
                    onRowsPerPageChange={this.handleChangeGridsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableFooter>
                )}
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}

function mapStateToProps(store) {
  return {
    currentUser: store.auth.currentUser,
  };
}

export default connect(mapStateToProps)(PainTable);
