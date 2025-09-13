
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import axios from 'axios';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ✅ Dummy orders
const dummyOrders = [
  {
    _id: 'ORD123456',
    user: { name: 'Amit Sharma' },
    vendor: { shopName: 'Fresh Mart' },
    items: [
      { name: 'Apples', qty: 2 },
      { name: 'Bananas', qty: 6 },
    ],
    total: 250,
    status: 'Delivered',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    _id: 'ORD123457',
    user: { name: 'Priya Verma' },
    vendor: { shopName: 'Daily Needs Store' },
    items: [{ name: 'Milk 1L', qty: 1 }],
    total: 50,
    status: 'Pending',
    createdAt: '2025-09-10T14:30:00Z',
  },
  {
    _id: 'ORD123458',
    user: { name: 'Rahul Mehta' },
    vendor: { shopName: 'Organic Hub' },
    items: [
      { name: 'Brown Rice', qty: 1 },
      { name: 'Olive Oil', qty: 1 },
    ],
    total: 600,
    status: 'Cancelled',
    createdAt: '2025-09-12T18:45:00Z',
  },
  {
    _id: 'ORD123459',
    user: { name: 'Sneha Patel' },
    vendor: { shopName: 'Spice Garden' },
    items: [
      { name: 'Turmeric Powder', qty: 1 },
      { name: 'Red Chili', qty: 2 },
      { name: 'Coriander Seeds', qty: 1 },
    ],
    total: 180,
    status: 'Processing',
    createdAt: '2025-09-13T09:15:00Z',
  },
  {
    _id: 'ORD123460',
    user: { name: 'Vikram Singh' },
    vendor: { shopName: 'Bakery Delight' },
    items: [
      { name: 'Whole Wheat Bread', qty: 2 },
      { name: 'Chocolate Cookies', qty: 1 },
    ],
    total: 120,
    status: 'Shipped',
    createdAt: '2025-09-12T16:20:00Z',
  },
];

// Custom Chip for Order Status
const StatusChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Shipped':
        return 'primary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'Delivered':
        return '✅';
      case 'Pending':
        return '⏳';
      case 'Processing':
        return '🔄';
      case 'Shipped':
        return '🚚';
      case 'Cancelled':
        return '❌';
      default:
        return '';
    }
  };

  return (
    <Chip
      label={`${getStatusIcon()} ${status}`}
      color={getStatusColor()}
      variant="outlined"
      size="small"
      sx={{ 
        fontWeight: 'medium',
        borderRadius: 1,
        px: 0.5
      }}
    />
  );
};

// Custom Table Row for Orders
const OrderTableRow = ({ 
  row, 
  selected, 
  handleClick 
}) => {
  return (
    <UserTableRow
      key={row._id}
      name={`ORD-${row._id.slice(-6)}`}
      role={row.user?.name || 'Unknown User'}
      status={row.status}
      statusColor={
        (() => {
          if (row.status === 'Delivered') return 'success';
          if (row.status === 'Pending') return 'warning';
          if (row.status === 'Processing') return 'info';
          if (row.status === 'Shipped') return 'primary';
          return 'error';
        })()
      }
      company={row.vendor?.shopName || 'N/A'}
      avatarUrl={null}
      selected={selected.indexOf(row._id) !== -1}
      handleClick={(event) => handleClick(event, row._id)}
      createdAt={new Date(row.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}
      updatedAt={`₹${row.total}`}
      customStatus={<StatusChip status={row.status} />}
    />
  );
};

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Orders (or use dummy if API fails)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://backend.minutos.shop/api/orders');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setOrders(res.data);
        } else {
          setOrders(dummyOrders); // fallback
        }
      } catch (err) {
        console.error('Error fetching orders, using dummy data:', err);
        setOrders(dummyOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Sorting
  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  // Select All
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = orders.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // Select One
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

  // Apply filtering
  const dataFiltered = applyFilter({
    inputData: orders,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" sx={{ 
          color: 'text.primary',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Box component="span" sx={{ 
            background: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
            borderRadius: 2,
            p: 0.5,
            display: 'inline-flex'
          }}>
            📦
          </Box>
          Orders Management
        </Typography>
      </Stack>

      <Card sx={{ 
        borderRadius: 2,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {loading && <LinearProgress />}
        
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          placeholder="Search orders, customers, or vendors..."
        />

        <Scrollbar>
          <TableContainer sx={{ 
            overflow: 'unset',
            minHeight: loading ? 400 : 'unset'
          }}>
            <Table sx={{ minWidth: 1000 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={orders.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: '_id', label: 'Order ID', align: 'left' },
                  { id: 'user', label: 'Customer', align: 'left' },
                  { id: 'vendor', label: 'Vendor', align: 'left' },
                  { id: 'total', label: 'Amount', align: 'right' },
                  { id: 'status', label: 'Status', align: 'center' },
                  { id: 'createdAt', label: 'Order Date', align: 'left' },
                  { id: '', label: 'Actions', align: 'right' },
                ]}
              />
              <TableBody>
                {!loading && dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <OrderTableRow
                      key={row._id}
                      row={row}
                      selected={selected}
                      handleClick={handleClick}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, orders.length)}
                />

                {notFound && <TableNoData query={filterName} />}
                
                {loading && (
                  <TableBody>
                    <TableEmptyRows height={300} emptyRows={5} />
                  </TableBody>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        />
      </Card>
    </Container>
  );
}