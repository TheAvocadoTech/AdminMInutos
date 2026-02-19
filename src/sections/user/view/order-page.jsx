/* eslint-disable */
import axios from "axios";
import { useState, useEffect, useMemo } from "react";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

import Scrollbar from "src/components/scrollbar";
import TableNoData from "../table-no-data";
import UserTableHead from "../user-table-head";
import TableEmptyRows from "../table-empty-rows";
import { emptyRows, getComparator } from "../utils";

/* ---------------- STATUS CHIP ---------------- */

const StatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "PLACED": return "warning";
      case "ACCEPTED": return "info";
      case "COMPLETED": return "success";
      case "REJECTED": return "error";
      default: return "default";
    }
  };

  return (
    <Chip label={status} color={getColor()} size="small" variant="outlined" />
  );
};

/* ---------------- TABLE ROW ---------------- */

const OrderTableRow = ({ row, selected, handleClick, handleView }) => {
  const isSelected = selected.indexOf(row._id) !== -1;

  return (
    <TableRow hover selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={(event) => handleClick(event, row._id)} />
      </TableCell>

      {/* Order Info */}
      <TableCell>
        <Typography variant="subtitle2" color="primary" sx={{ fontSize: '0.85rem' }}>
          #{row._id.slice(-6).toUpperCase()}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          {new Date(row.createdAt).toLocaleString("en-IN")}
        </Typography>
      </TableCell>

      {/* Vendor */}
      <TableCell>
        <Typography variant="body2">{row.vendor?.businessName || "N/A"}</Typography>
      </TableCell>

      {/* Items Preview */}
      <TableCell>
        <Stack spacing={1}>
          {row.items?.slice(0, 2).map((item, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <Avatar 
                src={item.product?.images?.[0]} 
                variant="rounded" 
                sx={{ width: 32, height: 32, border: '1px solid #eee' }} 
              />
              <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                {item.name} x{item.quantity}
              </Typography>
            </Stack>
          ))}
          {row.items?.length > 2 && (
            <Typography variant="caption" color="text.secondary">
              + {row.items.length - 2} more items
            </Typography>
          )}
        </Stack>
      </TableCell>

      {/* Amount */}
      <TableCell>
        <Typography color="success.main" fontWeight="600">
          ₹{row.totalAmount?.toFixed(2)}
        </Typography>
      </TableCell>

      {/* Status */}
      <TableCell align="center">
        <StatusChip status={row.status} />
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Button size="small" variant="contained" onClick={() => handleView(row)}>
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};

/* ---------------- MAIN PAGE ---------------- */

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleView = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://api.minutos.in/api/order/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setOrders(res.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const comparator = getComparator(order, orderBy);
  const dataFiltered = useMemo(() => [...orders].sort(comparator), [orders, comparator]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) setSelected(orders.map((n) => n._id));
    else setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = [...selected, id];
    else newSelected = selected.filter((item) => item !== id);
    setSelected(newSelected);
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight="bold">Orders Management</Typography>
        <Typography variant="subtitle1">Total: {orders.length}</Typography>
      </Stack>

      <Card>
        {loading && <LinearProgress />}
        <Scrollbar>
          <TableContainer>
            <Table>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={orders.length}
                numSelected={selected.length}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "order", label: "Order ID" },
                  { id: "vendor", label: "Vendor" },
                  { id: "items", label: "Products" },
                  { id: "amount", label: "Total" },
                  { id: "status", label: "Status", align: "center" },
                  { id: "actions", label: "Actions", align: "right" },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <OrderTableRow
                      key={row._id}
                      row={row}
                      selected={selected}
                      handleClick={handleClick}
                      handleView={handleView}
                    />
                  ))}
                <TableEmptyRows height={77} emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)} />
                {!dataFiltered.length && !loading && <TableNoData />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>

      {/* ================= DETAILED ORDER MODAL ================= */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Order Details - #{selectedOrder?._id}</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Vendor Details</Typography>
                  <Typography variant="h6">{selectedOrder.vendor?.businessName}</Typography>
                  <Typography variant="body2">{selectedOrder.vendor?.email}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="overline" color="text.secondary">Shipping To</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedOrder.shippingAddress?.name}</Typography>
                  <Typography variant="body2">{selectedOrder.shippingAddress?.line1}</Typography>
                  <Typography variant="body2">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </Typography>
                  <Typography variant="body2">📞 {selectedOrder.shippingAddress?.phone}</Typography>
                </Box>
              </Stack>

              <Typography variant="h6" gutterBottom>Purchased Items</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                {selectedOrder.items?.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 1.5 }}>
                    <Box 
                      component="img" 
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/80'} 
                      sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover', border: '1px solid #ddd' }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 
                      }}>
                        {item.product?.description}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Qty: <b>{item.quantity}</b></Typography>
                        <Typography variant="subtitle2" color="primary">₹{item.price} per unit</Typography>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#f4f6f8', borderRadius: 1 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">₹{selectedOrder.totalAmount}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">Grand Total:</Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">₹{selectedOrder.totalAmount}</Typography>
                </Stack>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">Close</Button>
          <Button variant="contained" color="primary">Order Done</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}