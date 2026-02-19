/* eslint-disable */
import axios from "axios";
import { useState, useEffect, useMemo, useRef } from "react";
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
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
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
  return <Chip label={status} color={getColor()} size="small" sx={{ fontWeight: 600, letterSpacing: 0.5 }} />;
};

/* ---------------- INFO SECTION CARD ---------------- */
const InfoCard = ({ title, icon, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      height: "100%",
      background: "linear-gradient(145deg, #f9fafb 0%, #ffffff 100%)",
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
      <span>{icon}</span> {title}
    </Typography>
    {children}
  </Paper>
);

/* ---------------- TABLE ROW ---------------- */
const OrderTableRow = ({ row, selected, handleClick, handleView }) => {
  const isSelected = selected.indexOf(row._id) !== -1;
  return (
    <TableRow hover selected={isSelected} sx={{ cursor: "pointer" }}>
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={(event) => handleClick(event, row._id)} />
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={700} color="primary.main">
          #{row._id.slice(-6).toUpperCase()}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(row.createdAt).toLocaleString("en-IN")}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row.vendor?.businessName || "N/A"}</Typography>
      </TableCell>
      <TableCell>
        {row.items?.slice(0, 2).map((item, i) => (
          <Typography key={i} variant="caption" display="block" color="text.secondary">
            {item.name} x{item.quantity}
          </Typography>
        ))}
        {row.items?.length > 2 && (
          <Typography variant="caption" color="primary">+ {row.items.length - 2} more items</Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>₹{row.totalAmount?.toFixed(2)}</Typography>
      </TableCell>
      <TableCell>
        <StatusChip status={row.status} />
      </TableCell>
      <TableCell>
        <Button size="small" variant="outlined" onClick={() => handleView(row)}>View</Button>
      </TableCell>
    </TableRow>
  );
};

/* ---------------- INVOICE PRINT STYLES ---------------- */
const invoiceStyles = `
  @media print {
    body * { visibility: hidden !important; }
    #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
    #invoice-print-area {
      position: fixed !important;
      top: 0; left: 0;
      width: 100vw;
      padding: 32px;
      background: white;
    }
    .no-print { display: none !important; }
  }
`;

/* ---------------- INVOICE COMPONENT ---------------- */
const AdminInvoice = ({ order }) => {
  if (!order) return null;
  const invoiceNumber = `INV-${order._id.slice(-8).toUpperCase()}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });
  const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || order.totalAmount;
  const tax = 0; // Adjust if you have tax data
  const grandTotal = order.totalAmount;

  return (
    <Box
      id="invoice-print-area"
      sx={{
        fontFamily: "'Georgia', serif",
        color: "#1a1a2e",
        background: "#fff",
        p: 4,
        minWidth: 600,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: "#1a1a2e", letterSpacing: -0.5 }}>
            MINUTOS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin Order Invoice
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#e63946" }}>
            INVOICE
          </Typography>
          <Typography variant="body2" color="text.secondary">{invoiceNumber}</Typography>
          <Typography variant="body2" color="text.secondary">Date: {invoiceDate}</Typography>
          <Box sx={{ mt: 1 }}>
            <StatusChip status={order.status} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ height: 3, background: "linear-gradient(90deg, #1a1a2e, #e63946)", borderRadius: 2, mb: 4 }} />

      {/* Vendor + Customer */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Typography variant="overline" color="text.secondary" fontSize={10}>Vendor / Seller</Typography>
          <Typography variant="body1" fontWeight={700}>{order.vendor?.businessName || "N/A"}</Typography>
          <Typography variant="body2" color="text.secondary">{order.vendor?.email}</Typography>
          {order.vendor?.phone && (
            <Typography variant="body2" color="text.secondary">📞 {order.vendor.phone}</Typography>
          )}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="overline" color="text.secondary" fontSize={10}>Ship To / Customer</Typography>
          <Typography variant="body1" fontWeight={700}>{order.shippingAddress?.name}</Typography>
          <Typography variant="body2" color="text.secondary">{order.shippingAddress?.line1}</Typography>
          {order.shippingAddress?.line2 && (
            <Typography variant="body2" color="text.secondary">{order.shippingAddress.line2}</Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </Typography>
          <Typography variant="body2" color="text.secondary">📞 {order.shippingAddress?.phone}</Typography>
        </Grid>
      </Grid>

      {/* Items Table */}
      <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e0e0e0", mb: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "3fr 0.5fr 1fr 1fr", background: "#1a1a2e", color: "#fff", px: 2, py: 1.5 }}>
          {["Item", "Qty", "Unit Price", "Total"].map((h) => (
            <Typography key={h} variant="caption" fontWeight={700} sx={{ color: "#fff", letterSpacing: 1, textTransform: "uppercase", fontSize: 10 }}>
              {h}
            </Typography>
          ))}
        </Box>
        {order.items?.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "grid",
              gridTemplateColumns: "3fr 0.5fr 1fr 1fr",
              px: 2, py: 1.5,
              borderBottom: index < order.items.length - 1 ? "1px solid #f0f0f0" : "none",
              background: index % 2 === 0 ? "#fafafa" : "#fff",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={item.image || item.product?.image || item.product?.images?.[0]}
                variant="rounded"
                sx={{
                  width: 40, height: 40,
                  bgcolor: "#1a1a2e",
                  fontSize: 14, fontWeight: 700,
                  flexShrink: 0,
                  border: "1px solid #e0e0e0",
                }}
              >
                {item.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                {item.product?.description && (
                  <Typography variant="caption" color="text.secondary">{item.product.description}</Typography>
                )}
                {item.sku && <Typography variant="caption" color="text.secondary" display="block">SKU: {item.sku}</Typography>}
              </Box>
            </Box>
            <Typography variant="body2">{item.quantity}</Typography>
            <Typography variant="body2">₹{item.price?.toFixed(2)}</Typography>
            <Typography variant="body2" fontWeight={600}>₹{(item.price * item.quantity).toFixed(2)}</Typography>
          </Box>
        ))}
      </Box>

      {/* Totals */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">₹{subtotal?.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Tax (GST)</Typography>
            <Typography variant="body2">₹{tax.toFixed(2)}</Typography>
          </Box>
          {order.discount > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
              <Typography variant="body2" color="success.main">Discount</Typography>
              <Typography variant="body2" color="success.main">-₹{order.discount?.toFixed(2)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{
            display: "flex", justifyContent: "space-between", py: 1,
            background: "#1a1a2e", borderRadius: 1.5, px: 1.5, mt: 1,
          }}>
            <Typography variant="body1" fontWeight={800} color="#fff">Grand Total</Typography>
            <Typography variant="body1" fontWeight={800} color="#e63946">₹{grandTotal?.toFixed(2)}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Payment & Order Info */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Typography variant="overline" color="text.secondary" fontSize={10}>Payment Method</Typography>
          <Typography variant="body2" fontWeight={600}>{order.paymentMethod || "N/A"}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="overline" color="text.secondary" fontSize={10}>Payment Status</Typography>
          <Typography variant="body2" fontWeight={600}>{order.paymentStatus || "N/A"}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="overline" color="text.secondary" fontSize={10}>Order ID</Typography>
          <Typography variant="body2" fontWeight={600} color="primary.main">#{order._id}</Typography>
        </Grid>
      </Grid>

      <Box sx={{ height: 1, background: "#e0e0e0", mb: 2 }} />
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
        This is a system-generated admin invoice. — Minutos Platform © {new Date().getFullYear()}
      </Typography>
    </Box>
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
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const handleView = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleOpenInvoice = () => {
    setOpen(false);
    setInvoiceOpen(true);
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
      <style>{invoiceStyles}</style>

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>Orders Management</Typography>
        <Chip label={`Total: ${orders.length}`} color="primary" variant="outlined" />
      </Stack>

      <Card>
        {loading && <LinearProgress />}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={orders.length}
                numSelected={selected.length}
                onRequestSort={(e, property) => {
                  setOrder(orderBy === property && order === "asc" ? "desc" : "asc");
                  setOrderBy(property);
                }}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "_id", label: "Order" },
                  { id: "vendor", label: "Vendor" },
                  { id: "items", label: "Items" },
                  { id: "totalAmount", label: "Amount" },
                  { id: "status", label: "Status" },
                  { id: "actions", label: "Actions" },
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
                  emptyRows={emptyRows(page, rowsPerPage, orders.length)}
                />
                {!dataFiltered.length && !loading && <TableNoData />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          count={orders.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* ================= DETAILED ORDER MODAL ================= */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Order Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #{selectedOrder?._id}
              </Typography>
            </Box>
            {selectedOrder && <StatusChip status={selectedOrder.status} />}
          </Box>
        </DialogTitle>
        <Divider />

        {selectedOrder && (
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              {/* Vendor */}
              <Grid item xs={12} sm={6}>
                <InfoCard title="Vendor Details" icon="🏪">
                  <Typography variant="body1" fontWeight={700}>{selectedOrder.vendor?.businessName}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.vendor?.email}</Typography>
                  {selectedOrder.vendor?.phone && (
                    <Typography variant="body2" color="text.secondary">📞 {selectedOrder.vendor.phone}</Typography>
                  )}
                  {selectedOrder.vendor?.address && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      📍 {selectedOrder.vendor.address}
                    </Typography>
                  )}
                </InfoCard>
              </Grid>

              {/* Shipping */}
              <Grid item xs={12} sm={6}>
                <InfoCard title="Shipping Address" icon="📦">
                  <Typography variant="body1" fontWeight={700}>{selectedOrder.shippingAddress?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.shippingAddress?.line1}</Typography>
                  {selectedOrder.shippingAddress?.line2 && (
                    <Typography variant="body2" color="text.secondary">{selectedOrder.shippingAddress.line2}</Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📞 {selectedOrder.shippingAddress?.phone}
                  </Typography>
                </InfoCard>
              </Grid>

              {/* Order Meta */}
              <Grid item xs={12} sm={6}>
                <InfoCard title="Order Information" icon="🧾">
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Order ID</Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        #{selectedOrder._id.slice(-8).toUpperCase()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Placed On</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedOrder.paymentMethod || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedOrder.paymentStatus || "N/A"}</Typography>
                    </Box>
                    {selectedOrder.updatedAt && (
                      <Box sx={{ gridColumn: "1/-1" }}>
                        <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(selectedOrder.updatedAt).toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </InfoCard>
              </Grid>

              {/* Delivery Info */}
              <Grid item xs={12} sm={6}>
                <InfoCard title="Delivery Details" icon="🚚">
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Delivery Type</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedOrder.deliveryType || "Standard"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Est. Delivery</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedOrder.estimatedDelivery || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Tracking ID</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedOrder.trackingId || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Courier</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedOrder.courier || "N/A"}</Typography>
                    </Box>
                  </Box>
                  {selectedOrder.deliveryNotes && (
                    <Box sx={{ mt: 1, p: 1, background: "#fff8e1", borderRadius: 1 }}>
                      <Typography variant="caption" color="warning.dark">
                        📝 Note: {selectedOrder.deliveryNotes}
                      </Typography>
                    </Box>
                  )}
                </InfoCard>
              </Grid>
            </Grid>

            {/* Items */}
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              🛒 Purchased Items ({selectedOrder.items?.length})
            </Typography>
            <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider", mb: 3 }}>
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "2fr 0.5fr 1fr 1fr",
                px: 2, py: 1,
                background: "grey.100",
                bgcolor: "#f5f5f5",
              }}>
                {["Product", "Qty", "Unit Price", "Total"].map((h) => (
                  <Typography key={h} variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: 10 }}>
                    {h}
                  </Typography>
                ))}
              </Box>
              {selectedOrder.items?.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 0.5fr 1fr 1fr",
                    px: 2, py: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    alignItems: "center",
                    background: index % 2 === 0 ? "transparent" : "#fafafa",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      src={item.image || item.product?.image || item.product?.images?.[0]}
                      variant="rounded"
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: "primary.light",
                        fontSize: 16,
                        fontWeight: 700,
                        flexShrink: 0,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {item.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                      {item.product?.description && (
                        <Typography variant="caption" color="text.secondary">{item.product.description}</Typography>
                      )}
                      {item.sku && (
                        <Typography variant="caption" color="text.disabled" display="block">SKU: {item.sku}</Typography>
                      )}
                      {item.variant && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Variant: {item.variant}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2">{item.quantity}</Typography>
                  <Typography variant="body2">₹{item.price?.toFixed(2)}</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Totals Summary */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ width: 260 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">
                    ₹{selectedOrder.items?.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                  </Typography>
                </Box>
                {selectedOrder.discount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography variant="body2" color="success.main">Discount</Typography>
                    <Typography variant="body2" color="success.main">-₹{selectedOrder.discount?.toFixed(2)}</Typography>
                  </Box>
                )}
                {selectedOrder.deliveryCharge > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Delivery</Typography>
                    <Typography variant="body2">₹{selectedOrder.deliveryCharge?.toFixed(2)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{
                  display: "flex", justifyContent: "space-between", py: 1,
                  px: 1.5, background: "#1a1a2e", borderRadius: 1.5,
                }}>
                  <Typography variant="body1" fontWeight={800} color="#fff">Grand Total</Typography>
                  <Typography variant="body1" fontWeight={800} sx={{ color: "#e63946" }}>
                    ₹{selectedOrder.totalAmount?.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Notes */}
            {selectedOrder.notes && (
              <Box sx={{ mt: 2, p: 2, background: "#fff8e1", borderRadius: 2 }}>
                <Typography variant="subtitle2" color="warning.dark" sx={{ mb: 0.5 }}>📝 Order Notes</Typography>
                <Typography variant="body2">{selectedOrder.notes}</Typography>
              </Box>
            )}
          </DialogContent>
        )}

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit">Close</Button>
          <Button onClick={handleOpenInvoice} variant="contained" color="primary">
            🖨️ Generate Invoice
          </Button>
          <Button variant="contained" color="success">Order Done</Button>
        </DialogActions>
      </Dialog>

      {/* ================= INVOICE DIALOG ================= */}
      <Dialog open={invoiceOpen} onClose={() => setInvoiceOpen(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight={700}>Admin Invoice</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" size="small" onClick={() => setInvoiceOpen(false)}>← Back</Button>
              <Button variant="contained" size="small" onClick={handlePrintInvoice} sx={{ background: "#1a1a2e" }}>
                🖨️ Print / Save PDF
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <AdminInvoice order={selectedOrder} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}