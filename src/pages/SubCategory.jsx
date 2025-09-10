/* eslint-disable perfectionist/sort-named-imports */
import axios from "axios";
import { Field, Formik, Form } from "formik";
import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdClear } from "react-icons/md";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

// API endpoints
const SUBCATEGORY_API = "https://backend.minutos.shop/api/subcategory";
const CATEGORY_API = "https://backend.minutos.shop/api/category/getcategories";

// Cloudinary config
const CLOUDINARY_UPLOAD_PRESET = "marketdata";
const CLOUDINARY_CLOUD_NAME = "de4ks8mkh";

export default function SubCategory() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingSub, setEditingSub] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(SUBCATEGORY_API);
      setSubcategories(res.data.subcategories || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSnackbar({ open: true, message: "Error fetching subcategories", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.secure_url;
    } catch (error) {
      throw new Error("Failed to upload image to Cloudinary");
    }
  };

  const handleImageUpload = async (event, setFieldValue) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSnackbar({ open: true, message: "Invalid file type", severity: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: "File too large (max 5MB)", severity: "error" });
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFieldValue("image", imageUrl);
      setSnackbar({ open: true, message: "Image uploaded", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  // Submit (Add/Update)
  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (editingSub) {
        await axios.put(`${SUBCATEGORY_API}/${editingSub._id}`, values);
        setSnackbar({ open: true, message: "Subcategory updated", severity: "success" });
      } else {
        await axios.post(SUBCATEGORY_API, values);
        setSnackbar({ open: true, message: "Subcategory added", severity: "success" });
      }
      resetForm();
      setEditingSub(null);
      fetchSubcategories();
    } catch (error) {
      setSnackbar({ open: true, message: "Error saving subcategory", severity: "error" });
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await axios.delete(`${SUBCATEGORY_API}/${id}`);
      setSnackbar({ open: true, message: "Deleted successfully", severity: "success" });
      fetchSubcategories();
    } catch (error) {
      setSnackbar({ open: true, message: "Error deleting subcategory", severity: "error" });
    }
  };

  // Pagination
  const handleChangePage = (event, value) => setPage(value);

  const paginatedSubs = subcategories.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Subcategory Management
      </Typography>

      <Formik
        initialValues={{
          name: editingSub?.name || "",
          category: editingSub?.category?._id || "", // ✅ FIXED (category as ID not object)
          image: editingSub?.image || "",
        }}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ resetForm, setFieldValue, values }) => (
          <Form style={{ marginBottom: "2rem" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              {/* Name */}
              <Field as={TextField} name="name" label="Subcategory Name" fullWidth />

              {/* Category Dropdown */}
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Field as={Select} name="category" value={values.category}>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Field>
              </FormControl>

              {/* Image */}
              <Field as={TextField} name="image" label="Image URL" fullWidth />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button component="label" variant="outlined" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e, setFieldValue)}
                  />
                </Button>
                {uploading && <CircularProgress size={24} />}
              </Box>

              {values.image && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={values.image}
                    alt="Preview"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </Box>
              )}

              {/* Buttons */}
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={uploading}>
                  {editingSub ? "Update" : "Add"}
                </Button>
                {editingSub && (
                  <IconButton
                    color="secondary"
                    onClick={() => {
                      setEditingSub(null);
                      resetForm();
                    }}
                  >
                    <MdClear />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Category</b></TableCell>
                  <TableCell><b>Image</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSubs.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>{sub.category?.name || "N/A"}</TableCell>
                    <TableCell>
                      <img
                        src={sub.image}
                        alt={sub.name}
                        width="80"
                        height="80"
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => setEditingSub(sub)}>
                        <MdEdit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(sub._id)}>
                        <MdDelete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {subcategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No subcategories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(subcategories.length / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
