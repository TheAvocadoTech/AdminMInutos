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
      case "PLACED":
        return "warning";
      case "SHIPPED":
        return "info";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Chip
      label={status}
      color={getColor()}
      size="small"
      variant="outlined"
    />
  );
};

/* ---------------- TABLE ROW ---------------- */

const OrderTableRow = ({
  row,
  selected,
  handleClick,
  handleView,
}) => {
  const isSelected = selected.indexOf(row._id) !== -1;

  return (
    <TableRow hover selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={(event) => handleClick(event, row._id)}
        />
      </TableCell>

      {/* Order Info */}
      <TableCell>
        <Typography fontWeight="600" color="primary">
          {row._id}
        </Typography>
        <Typography variant="caption" display="block">
          {new Date(row.createdAt).toLocaleString("en-IN")}
        </Typography>
      </TableCell>

      {/* Vendor */}
      <TableCell>
        {row.vendor?.businessName || "N/A"}
      </TableCell>

      {/* Items */}
      <TableCell>
        <Typography fontWeight="600">
          {row.items?.length} Items
        </Typography>
        {row.items?.slice(0, 2).map((item, i) => (
          <Typography key={i} variant="caption" display="block">
            • {item.name} × {item.quantity}
          </Typography>
        ))}
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
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleView(row)}
        >
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

  /* -------- MODAL STATE -------- */

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

  /* -------- FETCH ORDERS -------- */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "https://api.minutos.in/api/order/admin/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* -------- SORT -------- */

  const comparator = getComparator(order, orderBy);

  const dataFiltered = useMemo(() => {
    return [...orders].sort(comparator);
  }, [orders, comparator]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(orders.map((n) => n._id));
    } else {
      setSelected([]);
    }
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) newSelected = [...selected, id];
    else newSelected = selected.filter((item) => item !== id);

    setSelected(newSelected);
  };

  /* ---------------- UI ---------------- */

  return (
    <Container maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Orders Management
        </Typography>
        <Typography variant="body2">
          Total Orders: {orders.length}
        </Typography>
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
                  { id: "order", label: "Order Info" },
                  { id: "vendor", label: "Vendor" },
                  { id: "items", label: "Items" },
                  { id: "amount", label: "Amount" },
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

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(
                    page,
                    rowsPerPage,
                    dataFiltered.length
                  )}
                />

                {!dataFiltered.length && <TableNoData />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* ================= MODAL ================= */}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>

        <DialogContent dividers>
          {selectedOrder && (
            <Box>

              <Typography variant="h6">
                Order ID: {selectedOrder._id}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {new Date(
                  selectedOrder.createdAt
                ).toLocaleString("en-IN")}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight="600">
                Vendor:
              </Typography>
              <Typography gutterBottom>
                {selectedOrder.vendor?.businessName || "N/A"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight="600">
                Shipping Address:
              </Typography>

              <Typography>
                {selectedOrder.shippingAddress?.name}
              </Typography>

              <Typography>
                {selectedOrder.shippingAddress?.line1}
              </Typography>

              <Typography>
                {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.state}
              </Typography>

              <Typography>
                {selectedOrder.shippingAddress?.pincode}
              </Typography>

              <Typography>
                📞 {selectedOrder.shippingAddress?.phone}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight="600" gutterBottom>
                Items:
              </Typography>

              {selectedOrder.items?.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>
                    {item.name} × {item.quantity}
                  </Typography>

                  <Typography>
                    ₹{item.price * item.quantity}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography fontWeight="600">
                  Total Amount:
                </Typography>

                <Typography
                  fontWeight="600"
                  color="success.main"
                >
                  ₹{selectedOrder.totalAmount}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography fontWeight="600">
                  Status:
                </Typography>

                <StatusChip
                  status={selectedOrder.status}
                />
              </Box>

            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
