/* eslint-disable */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Container,
  TablePagination,
  Button,
  Stack,
  Chip,
} from "@mui/material";

// APIs
const USER_API = "https://api.minutos.in/api/vendor";
const UPDATE_VENDOR_STATUS_API =
  "https://api.minutos.in/api/vendor"; // /:id/status

export default function VendorData() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(USER_API);
      setUsers(res.data.vendors || []);
      setTotalCount(res.data.count || 0);
    } catch (err) {
      console.error("Error fetching vendors", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 ADMIN ONLY STATUS UPDATE
  const handleVendorStatus = async (vendorId, status) => {
    try {
      const token = localStorage.getItem("token"); // admin JWT

      await axios.patch(
        `${UPDATE_VENDOR_STATUS_API}/${vendorId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update UI instantly
      setUsers((prev) =>
        prev.map((u) =>
          u._id === vendorId ? { ...u, status } : u
        )
      );
    } catch (err) {
      console.error(
        "Status update failed",
        err.response?.data || err
      );
      alert(
        err.response?.status === 403
          ? "Admin access only"
          : "Something went wrong"
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Vendor Management (Admin)
      </Typography>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Business</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length ? (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((u) => {
                    const isFinal =
                      u.status === "ACCEPTED" ||
                      u.status === "REJECTED";

                    return (
                      <TableRow key={u._id}>
                        <TableCell>
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.phone}</TableCell>
                        <TableCell>
                          {u.businessName} ({u.businessType})
                        </TableCell>
                        <TableCell>{u.city}</TableCell>

                        <TableCell>
                          <Chip
                            label={u.status || "PENDING"}
                            color={
                              u.status === "ACCEPTED"
                                ? "success"
                                : u.status === "REJECTED"
                                ? "error"
                                : "warning"
                            }
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={isFinal}
                              onClick={() =>
                                handleVendorStatus(u._id, "ACCEPTED")
                              }
                            >
                              Accept
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={isFinal}
                              onClick={() =>
                                handleVendorStatus(u._id, "REJECTED")
                              }
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No vendors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Container>
  );
}
