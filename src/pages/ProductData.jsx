/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import axios from "axios";
import * as XLSX from "xlsx";
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
const SUBCATEGORY_API = "https://backend.minutos.shop/api/subcategory/";

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

  // ✅ Snackbar helper
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Fetch categories & subcategories
  useEffect(() => {
    (async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          axios.get(CATEGORY_API),
          axios.get(SUBCATEGORY_API),
        ]);
        setCategories(catRes.data.categories || []);
        setSubCategories(subRes.data.subcategories || []);
      } catch (err) {
        console.error("Error fetching categories/subcategories:", err);
        showSnackbar("Failed to load categories", "error");
      }
    })();
  }, []);

  // ✅ Filter subcategories by category
  const filterSubCategories = (categoryId) => {
    if (!categoryId) return setFilteredSubCategories([]);
    setFilteredSubCategories(
      subCategories.filter((sub) => sub.category?._id === categoryId)
    );
  };

  // ✅ Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    return res.data.secure_url;
  };

  // ✅ Multiple image upload handler
  const handleImageUpload = async (event, push) => {
    const files = event.target?.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files)
          .filter((file) => file.type.startsWith("image/"))
          .map((file) => uploadImageToCloudinary(file))
      );
      urls.forEach((url) => push(url));
      showSnackbar("Images uploaded successfully");
    } catch (err) {
      console.error("Error uploading images:", err);
      showSnackbar("Image upload failed", "error");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // ✅ Excel upload (bulk products)
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const products = rows.map((row, i) => ({
        name: row["Name"]?.trim() || `Unnamed-${i + 1}`,
        productName: row["Product Name"] || "",
        category: row["Category ID"] ? [row["Category ID"]] : [],
        subCategory: row["Sub Category ID"] ? [row["Sub Category ID"]] : [],
        unit: row["Unit"] || "",
        pack: row["Pack"] || "",
        description: row["Description"] || "",
        stock: Number(row["Stock"] || 0),
        originalPrice: Number(row["Original Price"] || 0),
        discountedMRP: Number(row["Discounted MRP"] || 0),
        rating: Number(row["Rating"] || 0),
        images: row["Images"]
          ? row["Images"].split(",").map((u) => u.trim())
          : [],
        more_details: {
          brand: row["Brand"] || "",
          expiry: row["Expiry"] || "",
        },
      }));

      if (!products.length) {
        showSnackbar("Excel file empty or invalid", "warning");
        return;
      }

      await axios.post(`${API_URL}/bulk`, { products });
      showSnackbar("Products uploaded successfully from Excel");
    } catch (err) {
      console.error("Excel upload error:", err);
      showSnackbar("Failed to process Excel", "error");
    } finally {
      event.target.value = "";
    }
  };

  // ✅ Submit new product
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      await axios.post(API_URL, values);
      showSnackbar("Product added successfully");
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      showSnackbar("Error saving product", "error");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // ✅ Pricing logic
  const calculatePricing = useCallback(
    (originalPrice, discountedMRP, setFieldValue) => {
      if (originalPrice && discountedMRP && discountedMRP <= originalPrice) {
        const discount = ((originalPrice - discountedMRP) / originalPrice) * 100;
        setFieldValue("discount", discount.toFixed(2));
        setFieldValue("amountSaving", originalPrice - discountedMRP);
        setFieldValue("price", discountedMRP);
      } else {
        setFieldValue("discount", 0);
        setFieldValue("amountSaving", 0);
        setFieldValue("price", originalPrice || 0);
      }
    },
    []
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 4, color: "primary.main", fontWeight: "bold" }}
      >
        Product Management
      </Typography>

      {/* ✅ Bulk Excel Upload */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Bulk Upload via Excel
        </Typography>
        <Button component="label" variant="outlined" fullWidth sx={{ mb: 2 }}>
          Upload Excel
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
          />
        </Button>
        <Typography variant="body2" color="text.secondary">
          Columns: Name, Product Name, Category ID, Sub Category ID, Unit, Pack,
          Description, Stock, Original Price, Discounted MRP, Rating, Images,
          Brand, Expiry
        </Typography>
      </Paper>

      {/* ✅ Formik Form */}
      <Formik
        initialValues={{
          name: "",
          productName: "",
          category: "",
          subCategory: "",
          unit: "",
          pack: "",
          description: "",
          stock: 0,
          originalPrice: 0,
          discountedMRP: 0,
          price: 0,
          discount: 0,
          amountSaving: 0,
          rating: 0,
          images: [],
          more_details: { brand: "", expiry: "" },
        }}
        validate={(values) => {
          const errors = {};
          if (!values.name) errors.name = "Required";
          if (!values.productName) errors.productName = "Required";
          if (!values.category) errors.category = "Required";
          if (values.rating < 0 || values.rating > 5)
            errors.rating = "Rating must be 0–5";
          return errors;
        }}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleChange, isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Left */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Product Info
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="name"
                        label="Name"
                        fullWidth
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
                        error={touched.productName && !!errors.productName}
                        helperText={touched.productName && errors.productName}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Field
                        as={TextField}
                        select
                        name="category"
                        label="Category"
                        fullWidth
                        onChange={(e) => {
                          handleChange(e);
                          filterSubCategories(e.target.value);
                          setFieldValue("subCategory", "");
                        }}
                      >
                        <MenuItem value="">
                          <em>Select</em>
                        </MenuItem>
                        {categories.map((c) => (
                          <MenuItem key={c._id} value={c._id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    <Grid item xs={6}>
                      <Field
                        as={TextField}
                        select
                        name="subCategory"
                        label="Sub Category"
                        fullWidth
                        disabled={!values.category}
                      >
                        <MenuItem value="">
                          <em>Select</em>
                        </MenuItem>
                        {filteredSubCategories.map((s) => (
                          <MenuItem key={s._id} value={s._id}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    <Grid item xs={6}>
                      <Field as={TextField} name="unit" label="Unit" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                      <Field as={TextField} name="pack" label="Pack Size" fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Extra Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Field as={TextField} name="more_details.brand" label="Brand" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                      <Field
                        as={TextField}
                        name="more_details.expiry"
                        type="date"
                        label="Expiry"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Right */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Images
                  </Typography>
                  <FieldArray name="images">
                    {({ push, remove }) => (
                      <>
                        <Button
                          component="label"
                          variant="outlined"
                          disabled={uploading}
                          fullWidth
                        >
                          {uploading ? "Uploading..." : "Upload Images"}
                          <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, push)}
                          />
                        </Button>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {values.images.map((img, i) => (
                            <Grid item xs={4} key={i}>
                              <Box position="relative">
                                <img
                                  src={img}
                                  alt={`img-${i}`}
                                  style={{
                                    width: "100%",
                                    height: 100,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => remove(i)}
                                  sx={{ position: "absolute", top: -5, right: -5 }}
                                >
                                  ✕
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Pricing
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Field as={TextField} name="stock" label="Stock" type="number" fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        name="originalPrice"
                        label="Original Price"
                        type="number"
                        fullWidth
                        value={values.originalPrice}
                        onChange={(e) => {
                          handleChange(e);
                          calculatePricing(+e.target.value, values.discountedMRP, setFieldValue);
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        name="discountedMRP"
                        label="Discounted MRP"
                        type="number"
                        fullWidth
                        value={values.discountedMRP}
                        onChange={(e) => {
                          handleChange(e);
                          calculatePricing(values.originalPrice, +e.target.value, setFieldValue);
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Field
                        as={TextField}
                        name="price"
                        label="Final Price"
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Preview
                  </Typography>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={values.images[0] || "https://via.placeholder.com/300x200"}
                    />
                    <CardContent>
                      <Typography variant="h6">{values.productName || "Product Name"}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {values.description || "Description..."}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{values.price}
                      </Typography>
                    </CardContent>
                  </Card>
                </Paper>
              </Grid>
            </Grid>

            <Box textAlign="center" mt={4}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || loading}
                size="large"
              >
                {loading ? "Saving..." : "Add Product"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      {/* ✅ Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
