import axios from 'axios';
import { useState, useEffect } from 'react';

import { alpha } from '@mui/material/styles';
// eslint-disable-next-line perfectionist/sort-imports
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
// eslint-disable-next-line perfectionist/sort-imports
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
// eslint-disable-next-line perfectionist/sort-imports
import Typography from '@mui/material/Typography';

import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import TableEmptyRows from '../table-empty-rows';
// eslint-disable-next-line perfectionist/sort-imports
import UserTableHead from '../user-table-head';
// eslint-disable-next-line perfectionist/sort-imports
import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function UserPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('phoneNumber');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [users, setUsers] = useState([]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('https://backend.minutos.shop/api/auth/all');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Sorting
  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  // Select all
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.phoneNumber);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // Select one
  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // Filtering
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#1f2937',
            fontWeight: 700,
          }}
        >
          Total Login Users
        </Typography>
      </Stack>

      {/* Main Card */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
        }}
      >
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          sx={{
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            // Red button styling for any buttons in toolbar
            '& button': {
              bgcolor: '#dc2626',
              color: 'white',
              '&:hover': {
                bgcolor: '#b91c1c',
              },
            },
          }}
        />

        {/* Scrollable Table */}
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              {/* Table Header */}
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'phoneNumber', label: 'Phone Number' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'createdAt', label: 'Created At' },
                  { id: 'updatedAt', label: 'Updated At' },
                  { id: '' },
                ]}
                sx={{
                  '& th': {
                    bgcolor: '#f3f4f6',
                    color: '#374151',
                    fontWeight: 'bold',
                  },
                }}
              />

              {/* Table Rows */}
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row._id}
                      name={row.phoneNumber}
                      role={row.isVerified ? 'Verified User' : 'Unverified'}
                      status={row.isVerified ? 'active' : 'inactive'}
                      statusColor={row.isVerified ? 'success' : 'error'}
                      company={`Created: ${new Date(
                        row.createdAt
                      ).toLocaleDateString()}`}
                      avatarUrl={null}
                      isVerified={row.isVerified}
                      selected={selected.indexOf(row.phoneNumber) !== -1}
                      handleClick={(event) =>
                        handleClick(event, row.phoneNumber)
                      }
                      createdAt={row.createdAt}
                      updatedAt={row.updatedAt}
                      // Red button styling for action buttons in rows
                      sx={{
                        '& button': {
                          color: '#dc2626',
                          '&:hover': {
                            bgcolor: alpha('#dc2626', 0.04),
                          },
                        },
                        '& .MuiIconButton-root': {
                          color: '#dc2626',
                          '&:hover': {
                            bgcolor: alpha('#dc2626', 0.04),
                          },
                        },
                      }}
                    />
                  ))}

                {/* Empty Rows */}
                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {/* Pagination */}
        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: '#374151',
            '& .MuiTablePagination-actions button': {
              color: '#dc2626',
              '&:hover': {
                bgcolor: alpha('#dc2626', 0.04),
              },
              '&.Mui-disabled': {
                color: '#d1d5db',
              },
            },
            '& .MuiTablePagination-selectIcon': {
              color: '#dc2626',
            },
          }}
        />
      </Card>
    </Container>
  );
}