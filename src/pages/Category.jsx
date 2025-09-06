/* eslint-disable perfectionist/sort-named-imports */
import axios from "axios";
import { Field, Formik,Form } from "formik";
import React, { useState, useEffect } from "react";

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
} from "@mui/material";


const API_URL = "https://minutosa-2.onrender.com/api/category";

// Cloudinary configuration - Replace with your actual values
const CLOUDINARY_UPLOAD_PRESET = "marketdata";
 // Replace with your upload preset
const CLOUDINARY_CLOUD_NAME = "de4ks8mkh"; // Replace with your cloud name

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSnackbar({ open: true, message: "Please select a valid image file", severity: "error" });
      return;
    }

    // Validate file size (5MB limit)
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
        await axios.put(`${API_URL}/update/${editingCategory._id}`, values);
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
      await axios.delete(`${API_URL}/delete/${id}`);
      setSnackbar({ open: true, message: "Category deleted", severity: "success" });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setSnackbar({ open: true, message: "Error deleting category", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Category Management
      </Typography>

      {/* Configuration Alert */}
      {(!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please configure your Cloudinary settings (CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET) to enable image uploads.
        </Alert>
      )}

      {/* Category Form */}
      <Formik
        initialValues={{
          name: editingCategory?.name || "",
          image: editingCategory?.image || "",
        }}
        enableReinitialize
        // validate={validateCategory}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, resetForm, setFieldValue, values }) => (
          <Form style={{ marginBottom: "2rem" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              {/* Name Field */}
              <Field
                as={TextField}
                name="name"
                label="Category Name"
                fullWidth
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />

              {/* Image Upload Section */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1">Category Image</Typography>
                
                {/* Image URL Field */}
                <Field
                  as={TextField}
                  name="image"
                  label="Image URL"
                  fullWidth
                  error={touched.image && Boolean(errors.image)}
                  helperText={touched.image && errors.image}
                />

                {/* Upload Button */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    // startIcon={<CloudUploadIcon />}
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

                {/* Image Preview */}
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
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={uploading}
                >
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
                    {/* <ClearIcon /> */}
                  </IconButton>
                )}
              </Box>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
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
              {categories.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      width="80" 
                      height="80"
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => setEditingCategory(cat)}>
                      {/* <EditIcon /> */}
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(cat._id)}>
                      {/* <DeleteIcon /> */}
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