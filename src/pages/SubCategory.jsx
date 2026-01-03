/* eslint-disable react/prop-types */
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable */

import axios from "axios";
import * as XLSX from "xlsx";
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
  Alert,
} from "@mui/material";
import CSVUploaderSub from "./SubCategoryCSv";
import {
  getCategories,
  } from "src/services/categoryService";
import {
  getSubCategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "src/services/SubcategoryService";

// Cloudinary config
const CLOUDINARY_UPLOAD_PRESET = "marketdata";
const CLOUDINARY_CLOUD_NAME = "dk4ha77nw";

export default function SubCategory() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingSub, setEditingSub] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      console.log("Categories data:", data);
      // Service returns res.data directly, so data.categories contains the array
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbar({ open: true, message: "Error fetching categories", severity: "error" });
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const data = await getSubCategories();
      console.log("Subcategories data:", data);
      // Service returns res.data directly, so data.subcategories contains the array
      setSubcategories(data.subcategories || []);
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
      console.error("Cloudinary upload error:", error);
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
      setSnackbar({ open: true, message: "Image uploaded successfully", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  // Submit (Add/Update) - FIXED: Using service functions
  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (editingSub) {
        await updateSubcategory(editingSub._id, values);
        setSnackbar({ open: true, message: "Subcategory updated successfully", severity: "success" });
      } else {
        await createSubcategory(values);
        setSnackbar({ open: true, message: "Subcategory added successfully", severity: "success" });
      }
      resetForm();
      setEditingSub(null);
      fetchSubcategories();
    } catch (error) {
      console.error("Error saving subcategory:", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "Error saving subcategory", 
        severity: "error" 
      });
    }
  };

  // Delete - FIXED: Using service function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await deleteSubcategory(id);
      setSnackbar({ open: true, message: "Subcategory deleted successfully", severity: "success" });
      fetchSubcategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "Error deleting subcategory", 
        severity: "error" 
      });
    }
  };

  // Pagination
  const handleChangePage = (event, value) => setPage(value);

  // Filter subcategories based on search query
  const filteredSubs = subcategories.filter(
    (sub) =>
      sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply pagination
  const paginatedSubs = filteredSubs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Red button styles
  const redButtonStyle = {
    bgcolor: '#dc2626',
    color: 'white',
    '&:hover': {
      bgcolor: '#b91c1c',
    },
  };

  const redOutlinedButtonStyle = {
    color: '#dc2626',
    borderColor: '#dc2626',
    '&:hover': {
      borderColor: '#b91c1c',
      bgcolor: 'rgba(220, 38, 38, 0.04)',
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Subcategory Management
      </Typography>

      {/* CSV Upload */}
      <Box sx={{ mb: 3 }}>
        <CSVUploaderSub onUploadSuccess={fetchSubcategories} />
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            💡 You can upload multiple subcategories at once using a CSV file.  
            Make sure your CSV includes columns like <b>Name</b>, <b>Category</b>, and <b>Image URL</b>.  
            <br />
            Example:  
            <code>Subcategory Name, Category, Image URL</code>
          </Typography>
        </Alert>
      </Box>

      {/* Formik Form */}
      <Formik
        initialValues={{
          name: editingSub?.name || "",
          category: editingSub?.category?._id || "",
          image: editingSub?.image || "",
        }}
        enableReinitialize
        onSubmit={handleSubmit}
        validate={(values) => {
          const errors = {};
          if (!values.name) errors.name = "Name is required";
          if (!values.category) errors.category = "Category is required";
          return errors;
        }}
      >
        {({ resetForm, setFieldValue, values, errors, touched }) => (
          <Form style={{ marginBottom: "2rem" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              <Field 
                as={TextField} 
                name="name" 
                label="Subcategory Name" 
                fullWidth 
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />

              <FormControl fullWidth error={touched.category && Boolean(errors.category)}>
                <InputLabel>Category</InputLabel>
                <Field as={Select} name="category" value={values.category}>
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Field>
                {touched.category && errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>

              <Field as={TextField} name="image" label="Image URL" fullWidth />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button 
                  component="label" 
                  variant="outlined" 
                  disabled={uploading}
                  sx={redOutlinedButtonStyle}
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
                  <img
                    src={values.image}
                    alt="Preview"
                    style={{ 
                      width: "100px", 
                      height: "100px", 
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0"
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={uploading}
                  sx={redButtonStyle}
                >
                  {editingSub ? "Update Subcategory" : "Add Subcategory"}
                </Button>
                {editingSub && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setEditingSub(null);
                      resetForm();
                    }}
                    startIcon={<MdClear />}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Search */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Search Subcategories"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or category..."
        />
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Category</b></TableCell>
                  <TableCell><b>Image</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSubs.length > 0 ? (
                  paginatedSubs.map((sub) => (
                    <TableRow key={sub._id} hover>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>{sub.category?.name || "N/A"}</TableCell>
                      <TableCell>
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            width="80"
                            height="80"
                            style={{ 
                              objectFit: "cover", 
                              borderRadius: "4px",
                              border: "1px solid #e0e0e0"
                            }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80?text=No+Image";
                            }}
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              bgcolor: '#f5f5f5', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="caption" color="textSecondary">
                              No Image
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => setEditingSub(sub)}
                          title="Edit"
                        >
                          <MdEdit />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(sub._id)}
                          title="Delete"
                        >
                          <MdDelete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                        {searchQuery 
                          ? "No subcategories found matching your search" 
                          : "No subcategories available. Add one to get started!"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredSubs.length > rowsPerPage && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={Math.ceil(filteredSubs.length / rowsPerPage)}
                page={page}
                onChange={handleChangePage}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}