/* eslint-disable perfectionist/sort-named-imports */
import axios from "axios";
import { Field, Formik, Form } from "formik";
import { FiEdit, FiTrash } from "react-icons/fi";
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

const ADS_API_URL = "https://backend.minutos.shop/api/ads";

// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = "marketdata"; 
const CLOUDINARY_CLOUD_NAME = "de4ks8mkh"; 

export default function AdsBanner() {
  const [ads, setAds] = useState([]);
  const [editingAd, setEditingAd] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch banners
  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ADS_API_URL}/get`);
      setAds(res.data.banners || []);   // ✅ API returns "banners"
    } catch (error) {
      console.error("Error fetching ads:", error);
      setSnackbar({ open: true, message: "Error fetching ads", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
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
      setSnackbar({ open: true, message: error.message || "Failed to upload image", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  // Handle form submit (create/update ad)
  const handleSubmit = async (values, { resetForm }) => {
    try { 
      if (editingAd) {
        // ⚡ Replace with real update endpoint when available
        await axios.put(`${ADS_API_URL}/${editingAd._id}`, values);
        setSnackbar({ open: true, message: "Ad updated successfully", severity: "success" });
      } else {
        await axios.post(`${ADS_API_URL}/create`, values);
        setSnackbar({ open: true, message: "Ad created successfully", severity: "success" });
      }
      resetForm();
      setEditingAd(null);
      fetchAds();
    } catch (error) {
      console.error("Error saving ad:", error);
      setSnackbar({ open: true, message: "Error saving ad", severity: "error" });
    }
  };

  // Delete ad
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;
    try {
      // ⚡ Replace with your actual delete endpoint
      await axios.delete(`${ADS_API_URL}/${id}`);
      setSnackbar({ open: true, message: "Ad deleted", severity: "success" });
      fetchAds();
    } catch (error) {
      console.error("Error deleting ad:", error);
      setSnackbar({ open: true, message: "Error deleting ad", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ads Banner Management
      </Typography>

      {(!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please configure Cloudinary settings.
        </Alert>
      )}

      {/* Ad Form */}
      <Formik
        initialValues={{
          Description: editingAd?.Description || "",
          image: editingAd?.image || "",
        }}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ resetForm, setFieldValue, values }) => (
          <Form style={{ marginBottom: "2rem" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              {/* Description */}
              <Field
                as={TextField}
                name="Description"
                label="Ad Description"
                fullWidth
              />

              {/* Image Upload */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1">Ad Image</Typography>
                <Field as={TextField} name="image" label="Image URL" fullWidth />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={uploading}
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
                      Preview:
                    </Typography>
                    <img
                      src={values.image}
                      alt="Ad preview"
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  </Box>
                )}
              </Box>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={uploading}>
                  {editingAd ? "Update" : "Add"}
                </Button>
                {editingAd && (
                  <Button
                    color="secondary"
                    onClick={() => {
                      setEditingAd(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Ads List */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Image</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad._id}>
                  <TableCell>{ad.Description}</TableCell>
                  <TableCell>
                    <img
                      src={ad.image}
                      alt={ad.Description}
                      width="80"
                      height="80"
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => setEditingAd(ad)}>
                      <FiEdit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(ad._id)}>
                      <FiTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {ads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No ads found
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
