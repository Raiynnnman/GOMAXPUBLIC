import React, { Component } from 'react';
import { connect } from 'react-redux';
import TableFooter from '@mui/material/TableFooter';
import TableSortLabel from '@mui/material/TableSortLabel';
import { styled } from '@mui/material/styles';
import cx from 'classnames';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import classnames from 'classnames';
import Grid from '@mui/material/Grid';
import translate from '../utils/translate';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { useTheme } from '@mui/material/styles';

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
        }
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeSort = this.handleChangeSort.bind(this);
        this.handleChangeGridsPerPage = this.handleChangeGridsPerPage.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    handleChangeSort(e,t) { 
        this.props.onSort(e)
    } 

    handleChangePage(e,t) { 
        this.props.onPageChange(t)
    } 

    handleChangeGridsPerPage(e,t) { 
        var v = t.key;
        v = v.replace("$","")
        v = v.replace(".","")
        this.props.onPageGridsPerPageChange(v)
    } 

    render() {
        return (
        <>
            <Grid container xs="12">
                <Grid item xs="12">
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }} size="small" aria-label="">
                        <TableHead>
                          <TableRow>
                            {this.props.columns.map((e) => { 
                                if (!e.hidden) { 
                                return(
                                <TableCell align={e.align} style={{backgroundColor:'#fa6a0a',color:'white'}}>
                                    {(!e.sort) && (
                                    <>
                                        {e.text}
                                    </>
                                    )}
                                    {(e.sort) && (
                                    <>
                                        <TableSortLabel
                                        active={e.sort}
                                        direction={e.direction}
                                        onClick={() => this.handleChangeSort(e)}>
                                        {e.text}
                                     </TableSortLabel>
                                    </>
                                    )}

                                </TableCell>
                                )
                            } else { 
                                return(<></>)
                            }
                            })}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.props.data.map((row) => (
                            <TableRow
                              key={row.id}
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                {this.props.columns.map((e) => { 
                                    if (!e.hidden) { 
                                        return (
                                            <TableCell align={e.align}> 
                                                {(e.formatter) && (<div>{e.formatter(e,row)}</div>)}
                                                {(!e.formatter) && (<div>{row[e.dataField]}</div>)}
                                            </TableCell>
                                        )
                                    } else { 
                                        return(<></>)  
                                    }
                                })}
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TablePagination
                              rowsPerPageOptions={[5, 10, 25]}
                              count={this.props.total ? this.props.total : this.props.data.length}
                              rowsPerPage={this.props.pageSize ? this.props.pageSize : 10}
                              page={this.props.page ? this.props.page : 0}
                              slotProps={{
                                select: {
                                  inputProps: {
                                    'aria-label': 'rows per page',
                                  },
                                  native: true,
                                },
                              }}
                              onPageChange={this.handleChangePage}
                              onGridsPerPageChange={this.handleChangeGridsPerPage}
                              ActionsComponent={TablePaginationActions}
                          />
                      </TableFooter>
                      </Table>
                    </TableContainer>
                </Grid>                
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
    }
}

export default connect(mapStateToProps)(PainTable);
