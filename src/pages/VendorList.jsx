/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
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
} from "@mui/material";

const USER_API = "https://backend.minutos.shop/api/vendor/getAllVendors";
const UPDATE_VENDOR_API = "https://bakcend-n9kq.onrender.com/User/update"; // Update status API

export default function VendorData() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(USER_API);

      // FIX: API returns { message: "...", vendors: [...] }
      setUsers(res.data.vendors || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // handle vendor accept/reject
  const handleVendorStatus = async (id, status) => {
    try {
      await axios.put(`${UPDATE_VENDOR_API}/${id}`, { status });

      // Update UI immediately
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status } : u))
      );
    } catch (err) {
      console.error(`Error updating vendor ${status}:`, err);
    }
  };

  // pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Vendor Management
      </Typography>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Business</TableCell>
                <TableCell>City</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Pin Code</TableCell>
                <TableCell>Awards Nominee</TableCell>
                <TableCell>Accept Messages</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>{u.firstName}</TableCell>
                      <TableCell>{u.lastName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                      <TableCell>
                        {u.businessName} ({u.businessType})
                      </TableCell>
                      <TableCell>{u.city}</TableCell>
                      <TableCell>{u.state}</TableCell>
                      <TableCell>{u.pinCode}</TableCell>
                      <TableCell>{u.nominateForAwards ? "Yes" : "No"}</TableCell>
                      <TableCell>{u.acceptMessages ? "Yes" : "No"}</TableCell>
                      <TableCell>{u.status || "PENDING"}</TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleVendorStatus(u._id, "ACCEPTED")}
                          >
                            Accept
                          </Button>

                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleVendorStatus(u._id, "REJECTED")}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No vendors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={users.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Container>
  );
}
