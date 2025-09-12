/* eslint-disable perfectionist/sort-named-imports */
import axios from "axios";
import { Field, FieldArray, Formik, Form } from "formik";
import React, { useState, useEffect, useCallback } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Typography,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";

const API_URL = "https://backend.minutos.shop/api/product";
const CATEGORY_API = "https://backend.minutos.shop/api/category/getcategories";
const SUBCATEGORY_API = "https://backend.minutos.shop//api/subcategory/";

// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = "marketdata";
const CLOUDINARY_CLOUD_NAME = "de4ks8mkh";

export default function ProductData() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbar({
        open: true,
        message: "Error fetching categories",
        severity: "error",
      });
    }
  };

  // Fetch all subcategories
  const fetchSubCategories = async () => {
    try {
      const res = await axios.get(SUBCATEGORY_API);
      setSubCategories(res.data.subcategories || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSnackbar({
        open: true,
        message: "Error fetching subcategories",
        severity: "error",
      });
    }
  };

  // Filter subcategories based on selected category
  const filterSubCategories = (categoryId) => {
    if (!categoryId) {
      setFilteredSubCategories([]);
      return;
    }
    
    const filtered = subCategories.filter(
      (sub) => sub.category && sub.category._id === categoryId
    );
    setFilteredSubCategories(filtered);
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary configuration is missing.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data.secure_url;
  };

  // Handle multiple image upload
  const handleImageUpload = async (event, push) => {
    const files = event.target?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => uploadImageToCloudinary(file));

      const urls = await Promise.all(uploadPromises);

      urls.forEach((url) => push(url));

      setSnackbar({
        open: true,
        message: "Images uploaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Error uploading images",
        severity: "error",
      });
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      await axios.post(API_URL, values);
      setSnackbar({
        open: true,
        message: "Product added successfully",
        severity: "success",
      });
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error saving product",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate pricing fields
  const calculatePricing = useCallback((originalPrice, discountedMRP, setFieldValue) => {
    if (originalPrice > 0 && discountedMRP > 0 && discountedMRP <= originalPrice) {
      const discount = ((originalPrice - discountedMRP) / originalPrice) * 100;
      const amountSaving = originalPrice - discountedMRP;

      setFieldValue("discount", Math.round(discount * 100) / 100);
      setFieldValue("amountSaving", Math.round(amountSaving * 100) / 100);
      setFieldValue("price", discountedMRP);
    } else if (originalPrice > 0 && (discountedMRP === 0 || discountedMRP === "")) {
      setFieldValue("discount", 0);
      setFieldValue("amountSaving", 0);
      setFieldValue("price", originalPrice);
    } else if (originalPrice === 0 || originalPrice === "") {
      setFieldValue("discount", 0);
      setFieldValue("amountSaving", 0);
      setFieldValue("price", 0);
    }
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
        Add New Product
      </Typography>

      <Formik
        initialValues={{
          name: "",
          productName: "",
          images: [],
          category: "",
          subCategory: "",
          unit: "",
          stock: 0,
          price: 0,
          originalPrice: 0,
          discountedMRP: 0,
          discount: 0,
          amountSaving: 0,
          description: "",
          pack: "",
          rating: 0,
          more_details: {
            brand: "",
            expiry: "",
          },
        }}
        validate={(values) => {
          const errors = {};
          
          if (!values.name?.trim()) errors.name = "Name is required";
          if (!values.productName?.trim()) errors.productName = "Product name is required";
          if (!values.category) errors.category = "Category is required";
          if (values.stock < 0) errors.stock = "Stock cannot be negative";
          if (values.originalPrice < 0) errors.originalPrice = "Original price cannot be negative";
          if (values.discountedMRP < 0) errors.discountedMRP = "Discounted MRP cannot be negative";
          if (values.discountedMRP > values.originalPrice && values.originalPrice > 0) {
            errors.discountedMRP = "Discounted MRP cannot be greater than original price";
          }
          if (values.rating < 0 || values.rating > 5) {
            errors.rating = "Rating must be between 0 and 5";
          }
          if (values.images.length === 0) {
            errors.images = "At least one product image is required";
          }

          return errors;
        }}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting, handleChange }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Left Column - Product Details */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', pb: 2 }}>
                    Product Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="name"
                        label="Name"
                        fullWidth
                        required
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="productName"
                        label="Product Name"
                        fullWidth
                        required
                        error={touched.productName && !!errors.productName}
                        helperText={touched.productName && errors.productName}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        select
                        name="category"
                        label="Category"
                        fullWidth
                        required
                        error={touched.category && !!errors.category}
                        helperText={touched.category && errors.category}
                        onChange={(e) => {
                          handleChange(e);
                          filterSubCategories(e.target.value);
                          setFieldValue("subCategory", ""); // Reset subcategory when category changes
                        }}
                      >
                        <MenuItem value="">
                          <em>Select a category</em>
                        </MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        select
                        name="subCategory"
                        label="Sub Category"
                        fullWidth
                        disabled={!values.category}
                      >
                        <MenuItem value="">
                          <em>Select a subcategory</em>
                        </MenuItem>
                        {filteredSubCategories.map((sub) => (
                          <MenuItem key={sub._id} value={sub._id}>
                            {sub.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="unit"
                        label="Unit (e.g., 1L, 500g)"
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="pack"
                        label="Pack Size"
                        fullWidth
                        placeholder="e.g., Pack of 2, Single pack"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Enter product description..."
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="rating"
                        label="Rating (0-5)"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0, max: 5, step: 0.1 }}
                        error={touched.rating && !!errors.rating}
                        helperText={touched.rating && errors.rating}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                
                <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', pb: 2 }}>
                    Additional Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="more_details.brand"
                        label="Brand"
                        fullWidth
                        placeholder="Enter brand name"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="more_details.expiry"
                        label="Expiry Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Right Column - Images and Pricing */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', pb: 2 }}>
                    Product Images
                  </Typography>
                  
                  <FieldArray name="images">
                    {({ push, remove }) => (
                      <Box>
                        <Button
                          component="label"
                          variant="outlined"
                          disabled={uploading}
                          startIcon={uploading ? <CircularProgress size={16} />:null }
                          fullWidth
                          sx={{ mb: 2 }}
                        >   
                          {uploading ? "Uploading..." : "Upload Images"}
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            multiple
                            onChange={(e) => handleImageUpload(e, push)}
                          />
                        </Button>
                        
                        {errors.images && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                            {errors.images}
                          </Typography>
                        )}
                        
                        {values.images.length > 0 && (
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            {values.images.map((img, idx) => (
                              <Grid item xs={4} sm={3} key={idx}>
                                <Box sx={{ position: "relative" }}>
                                  <img
                                    src={img}
                                    alt={`product-${idx}`}
                                    style={{ 
                                      width: '100%',
                                      height: '100px',
                                      objectFit: "cover", 
                                      borderRadius: 8,
                                      border: '1px solid #ddd'
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => remove(idx)}
                                    sx={{
                                      position: "absolute",
                                      top: -8,
                                      right: -8,
                                      background: "#fff",
                                      boxShadow: 1,
                                      "&:hover": {
                                        background: "#f5f5f5",
                                      },
                                    }}
                                  >
                                    {/* <DeleteIcon fontSize="small" /> */}
                                  </IconButton>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Box>
                    )}
                  </FieldArray>
                </Paper>
                
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', pb: 2 }}>
                    Pricing
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="stock"
                        label="Stock"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0 }}
                        error={touched.stock && !!errors.stock}
                        helperText={touched.stock && errors.stock}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="originalPrice"
                        label="Original Price"
                        type="number"
                        fullWidth
                        value={values.originalPrice}
                        onChange={(e) => {
                          handleChange(e);
                          calculatePricing(
                            parseFloat(e.target.value) || 0, 
                            values.discountedMRP, 
                            setFieldValue
                          );
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                        error={touched.originalPrice && !!errors.originalPrice}
                        helperText={touched.originalPrice && errors.originalPrice}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="discountedMRP"
                        label="Discounted MRP"
                        type="number"
                        fullWidth
                        value={values.discountedMRP}
                        onChange={(e) => {
                          handleChange(e);
                          calculatePricing(
                            values.originalPrice, 
                            parseFloat(e.target.value) || 0, 
                            setFieldValue
                          );
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                        error={touched.discountedMRP && !!errors.discountedMRP}
                        helperText={touched.discountedMRP && errors.discountedMRP}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="price"
                        label="Final Price (auto)"
                        type="number"
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{ backgroundColor: '#f5f5f5' }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="discount"
                        label="Discount % (auto)"
                        type="number"
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{ backgroundColor: '#f5f5f5' }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="amountSaving"
                        label="Amount Saving (auto)"
                        type="number"
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{ backgroundColor: '#f5f5f5' }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', pb: 2 }}>
                    Live Preview
                  </Typography>
                  
                  <Card
                    sx={{
                      maxWidth: '100%',
                      boxShadow: 3,
                      borderRadius: 2,
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        values.images[0] ||
                        "https://via.placeholder.com/300x200?text=No+Image"
                      }
                      alt={values.productName || "Preview Image"}
                      sx={{ borderRadius: "8px 8px 0 0" }}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {values.productName || "Product Name"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {values.description ||
                          "Product description will appear here."}
                      </Typography>

                      {values.unit && (
                        <Typography variant="caption" color="text.secondary">
                          {values.unit}
                        </Typography>
                      )}

                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ₹{values.price || 0}
                        </Typography>
                        {values.originalPrice > 0 && values.discountedMRP > 0 && values.originalPrice !== values.discountedMRP && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: "line-through",
                                color: "text.secondary",
                              }}
                            >
                              ₹{values.originalPrice}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="error"
                              fontWeight="bold"
                            >
                              {values.discount}% OFF
                            </Typography>
                          </>
                        )}
                      </Box>

                      {values.amountSaving > 0 && (
                        <Typography variant="body2" color="success.main" mt={1}>
                          You Save: ₹{values.amountSaving}
                        </Typography>
                      )}

                      {values.rating > 0 && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          ⭐ {values.rating}/5
                        </Typography>
                      )}

                      {values.stock !== undefined && (
                        <Typography 
                          variant="caption" 
                          color={values.stock > 0 ? "success.main" : "error"}
                          sx={{ mt: 1, display: 'block' }}
                        >
                          {values.stock > 0 ? `In Stock (${values.stock})` : "Out of Stock"}
                        </Typography>
                      )}

                      {values.more_details?.brand && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Brand: {values.more_details.brand}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Paper>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={uploading || isSubmitting || loading}
                size="large"
                sx={{ minWidth: 200 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Adding Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}