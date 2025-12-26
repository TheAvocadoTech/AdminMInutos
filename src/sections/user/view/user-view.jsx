/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import { useState, useEffect } from 'react';

import { alpha } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import Scrollbar from 'src/components/scrollbar';
import { getAllUsers } from 'src/services/authService';

import TableNoData from '../table-no-data';
import TableEmptyRows from '../table-empty-rows';
import UserTableHead from '../user-table-head';
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
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();

        console.log('API Response:', data);

        // Extract users array from the response
        const usersArray = data?.users || data?.data || data || [];

        console.log('Users array:', usersArray);

        // Format the data - no changes needed, just clean mapping
        const formattedUsers = usersArray.map((user, index) => {
          console.log(`User ${index}:`, user);
          console.log(`Phone Number for user ${index}:`, user.phoneNumber);
          
          return {
            _id: user._id,
            phoneNumber: user.phoneNumber, // Direct mapping, no fallback
            isVerified: user.isVerified || false,
            isAdmin: user.isAdmin || false,
            role: user.role || 'USER',
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString(),
          };
        });

        console.log('Formatted users:', formattedUsers);
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
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
      const newSelecteds = users.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // Select one
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
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

  if (loading) {
    return (
      <Container>
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
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading users...</Typography>
        </Card>
      </Container>
    );
  }

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
          Total Login Users ({users.length})
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
          selectedUsers={selected}
          users={users}
          sx={{
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
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
            <Table sx={{ minWidth: 1000 }}>
              {/* Table Header */}
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: '_id', label: 'User ID', align: 'left' },
                  { id: 'phoneNumber', label: 'Phone Number', align: 'left' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'isAdmin', label: 'Admin', align: 'center' },
                  { id: 'role', label: 'Role', align: 'center' },
                  { id: 'createdAt', label: 'Created At', align: 'left' },
                  { id: 'updatedAt', label: 'Updated At', align: 'left' },
                  { id: 'actions', label: 'Actions', align: 'center' },
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
                {dataFiltered.length > 0 ? (
                  dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      console.log('Rendering row with phone:', row.phoneNumber);
                      return (
                        <UserTableRow
                          key={row._id}
                          id={row._id}
                          phoneNumber={row.phoneNumber}
                          isVerified={row.isVerified}
                          isAdmin={row.isAdmin}
                          role={row.role}
                          selected={selected.indexOf(row._id) !== -1}
                          handleClick={(event) => handleClick(event, row._id)}
                          createdAt={row.createdAt}
                          updatedAt={row.updatedAt}
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
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        {filterName ? 'No users found matching your search' : 'No users available'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty Rows */}
                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
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
          count={dataFiltered.length}
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