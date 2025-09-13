/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import axios from "axios";
import * as XLSX from "xlsx";
import { Field, Formik, Form } from "formik";
import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdClear } from "react-icons/md";

import {
  Alert,
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
} from "@mui/material";

const API_URL = "https://backend.minutos.shop/api/category";

// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = "marketdata";
const CLOUDINARY_CLOUD_NAME = "de4ks8mkh";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/getcategories`);
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbar({ open: true, message: "Error fetching categories", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Excel upload handler
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      setSnackbar({ open: true, message: "Please upload a valid Excel file (.xlsx)", severity: "error" });
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Expecting Excel columns: name | image
      const formatted = rows.map((row) => ({
        name: row.name || row.Name || "",
        image: row.image || row.Image || "",
      }));

      if (formatted.length === 0) {
        setSnackbar({ open: true, message: "Excel file is empty", severity: "error" });
        return;
      }

      // Bulk upload to backend
      await axios.post(`${API_URL}/bulk-upload`, { categories: formatted });
      setSnackbar({ open: true, message: "Categories uploaded from Excel", severity: "success" });
      fetchCategories();
    } catch (error) {
      console.error("Excel upload error:", error);
      setSnackbar({ open: true, message: "Failed to process Excel file", severity: "error" });
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary configuration is missing.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  };

  // Handle image upload
  const handleImageUpload = async (event, setFieldValue) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSnackbar({ open: true, message: "Please select a valid image file", severity: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: "File size should be less than 5MB", severity: "error" });
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFieldValue("image", imageUrl);
      setSnackbar({ open: true, message: "Image uploaded successfully", severity: "success" });
    } catch (error) {
      console.error("Upload error:", error);
      setSnackbar({ open: true, message: error.message || "Failed to upload image", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  // Handle form submit (add or update)
  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/updatecategories/${editingCategory._id}`, values);
        setSnackbar({ open: true, message: "Category updated successfully", severity: "success" });
      } else {
        await axios.post(`${API_URL}/categories`, values);
        setSnackbar({ open: true, message: "Category added successfully", severity: "success" });
      }
      resetForm();
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      setSnackbar({ open: true, message: "Error saving category", severity: "error" });
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/deletecategories/${id}`);
      setSnackbar({ open: true, message: "Category deleted", severity: "success" });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setSnackbar({ open: true, message: "Error deleting category", severity: "error" });
    }
  };

  // Pagination logic
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const paginatedCategories = categories.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Category Management
      </Typography>

      {(!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please configure your Cloudinary settings.
        </Alert>
      )}

      {/* Excel Upload */}
      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" component="label">
          Upload Excel
          <input type="file" accept=".xlsx" hidden onChange={handleExcelUpload} />
        </Button>
        <Typography variant="body2" color="text.secondary">
          (Excel file should have columns: <b>name</b>, <b>image</b>)
        </Typography>
      </Box>

      {/* Category Form */}
      <Formik
        initialValues={{
          name: editingCategory?.name || "",
          image: editingCategory?.image || "",
        }}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ errors, touched, resetForm, setFieldValue, values }) => (
          <Form style={{ marginBottom: "2rem" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              <Field
                as={TextField}
                name="name"
                label="Category Name"
                fullWidth
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />

              {/* Image Upload */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1">Category Image</Typography>
                <Field
                  as={TextField}
                  name="image"
                  label="Image URL"
                  fullWidth
                  error={touched.image && Boolean(errors.image)}
                  helperText={touched.image && errors.image}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={uploading || (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET)}
                  >
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
                    <Typography variant="subtitle2" gutterBottom>
                      Image Preview:
                    </Typography>
                    <img
                      src={values.image}
                      alt="Category preview"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Form Actions */}
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={uploading}>
                  {editingCategory ? "Update" : "Add"}
                </Button>
                {editingCategory && (
                  <IconButton
                    color="secondary"
                    onClick={() => {
                      setEditingCategory(null);
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
                  <TableCell><b>Image</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCategories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>
                      <img
                        src={cat.image}
                        alt={cat.name}
                        width="80"
                        height="80"
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => setEditingCategory(cat)}>
                        <MdEdit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(cat._id)}>
                        <MdDelete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(categories.length / rowsPerPage)}
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
/* eslint-disable react/prop-types */
/* eslint-disable */