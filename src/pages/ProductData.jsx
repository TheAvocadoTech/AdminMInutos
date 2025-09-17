/* eslint-disable react/prop-types */
/* eslint-disable */
import axios from "axios";
import { Field, FieldArray, Formik, Form } from "formik";
import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";

const API_URL = "https://backend.minutos.shop/api/product";
const CATEGORY_API = "https://backend.minutos.shop/api/category/getcategories";
const SUBCATEGORY_API = "https://backend.minutos.shop/api/subcategory/";

const CLOUDINARY_UPLOAD_PRESET = "marketdata";
const CLOUDINARY_CLOUD_NAME = "de4ks8mkh";

export default function ProductData() {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
useEffect(() => {
  if (editingProduct?.category?.[0]?._id) {
    filterSubCategories(editingProduct.category[0]._id);
  }
}, [editingProduct]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes, prodRes] = await Promise.all([
          axios.get(CATEGORY_API),
          axios.get(SUBCATEGORY_API),
          axios.get(API_URL),
        ]);
        setCategories(catRes.data.categories || []);
        setSubCategories(subRes.data.subcategories || []);
        setProducts(prodRes.data.data || []);
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load data", "error");
      }
    };
    fetchData();
  }, []);

  const filterSubCategories = (categoryId) => {
    if (!categoryId) return setFilteredSubCategories([]);
    setFilteredSubCategories(subCategories.filter((sub) => sub.category?._id === categoryId));
  };

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
      console.error(err);
      showSnackbar("Image upload failed", "error");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const calculatePricing = useCallback((originalPrice, discountedMRP, setFieldValue) => {
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
  }, []);

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/id/${editingProduct._id}`, values);
        showSnackbar("Product updated successfully");
      } else {
        await axios.post(`${API_URL}/create`, values);
        showSnackbar("Product added successfully");
      }
      const prodRes = await axios.get(API_URL);
      setProducts(prodRes.data.data || []);
      resetForm();
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      showSnackbar("Error saving product", "error");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleEdit = (product) => setEditingProduct(product);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/id/${id}`);
      showSnackbar("Product deleted successfully");
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete product", "error");
    }
  };

  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const handleNextPage = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Product Management
      </Typography>

      <Formik
        enableReinitialize
        initialValues={{
          name: editingProduct?.name || "",
          productName: editingProduct?.productName || "",
          category: editingProduct?.category?.[0]?._id || "",
          subCategory: editingProduct?.subCategory?.[0]?._id || "",
          unit: editingProduct?.unit || "",
          pack: editingProduct?.pack || "",
          description: editingProduct?.description || "",
          stock: editingProduct?.stock || 0,
          originalPrice: editingProduct?.originalPrice || 0,
          discountedMRP: editingProduct?.discountedMRP || 0,
          price: editingProduct?.price || 0,
          discount: editingProduct?.discount || 0,
          amountSaving: editingProduct?.amountSaving || 0,
          rating: editingProduct?.rating || 0,
          images: editingProduct?.images || [],
          more_details: {
            brand: editingProduct?.more_details?.brand || "",
            expiry: editingProduct?.more_details?.expiry || "",
          },
        }}
        validate={(values) => {
          const errors = {};
          if (!values.name) errors.name = "Required";
          if (!values.productName) errors.productName = "Required";
          if (!values.category) errors.category = "Required";
          if (values.rating < 0 || values.rating > 5) errors.rating = "Rating must be 0–5";
          return errors;
        }}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleChange, isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Left Form */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="red" gutterBottom>
                    Product Info
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        name="name"
                        label="Name"
                        fullWidth
                        value={values.name}
                        onChange={handleChange}
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="productName"
                        label="Product Name"
                        fullWidth
                        value={values.productName}
                        onChange={handleChange}
                        error={touched.productName && !!errors.productName}
                        helperText={touched.productName && errors.productName}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        select
                        name="category"
                        label="Category"
                        fullWidth
                        value={values.category}
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
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
  select
  name="subCategory"
  label="Sub Category"
  fullWidth
  value={values.subCategory}
  disabled={!values.category}
  onChange={handleChange}
>
  <MenuItem value="">
    <em>Select</em>
  </MenuItem>
  {filteredSubCategories.map((s) => (
    <MenuItem key={s._id} value={s._id}>
      {s.name}
    </MenuItem>
  ))}
</TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="unit" label="Unit" fullWidth value={values.unit} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="pack" label="Pack Size" fullWidth value={values.pack} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={values.description}
                        onChange={handleChange}
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
                      <TextField
                        name="more_details.brand"
                        label="Brand"
                        fullWidth
                        value={values.more_details.brand}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        name="more_details.expiry"
                        type="date"
                        label="Expiry"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={values.more_details.expiry}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Right Form */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="red" gutterBottom>
                    Images
                  </Typography>
                  <FieldArray name="images">
                    {({ push, remove }) => (
                      <>
                        <Button component="label" variant="outlined" disabled={uploading} fullWidth>
                          {uploading ? "Uploading..." : "Upload Images"}
                          <input type="file" hidden multiple accept="image/*" onChange={(e) => handleImageUpload(e, push)} />
                        </Button>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {values.images.map((img, i) => (
                            <Grid item xs={4} key={i}>
                              <Box position="relative">
                                <img
                                  src={img}
                                  alt={`img-${i}`}
                                  style={{ width: "100%", height: 100, borderRadius: 8, objectFit: "cover" }}
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
                      <TextField name="stock" label="Stock" type="number" fullWidth value={values.stock} onChange={handleChange} />
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
                      <TextField name="price" label="Final Price" fullWidth value={values.price} InputProps={{ readOnly: true }} />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Image Preview Card */}
                {values.images.length > 0 && (
                  <Card>
                    <CardMedia component="img" height="200" image={values.images[0]} />
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
                )}
              </Grid>
            </Grid>

            <Box textAlign="center" mt={4}>
              <Button type="submit" variant="contained" disabled={isSubmitting || loading} size="large">
                {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Product Table */}
      <Paper sx={{ mt: 6 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Sub Category</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentProducts.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/50"}
                      alt={p.name}
                      style={{ width: 50, height: 50, borderRadius: 4, objectFit: "cover" }}
                    />
                  </TableCell>
                  <TableCell>{p.productName || p.name}</TableCell>
                  <TableCell>{p.category?.[0]?.name || "-"}</TableCell>
                  <TableCell>{p.subCategory?.[0]?.name || "-"}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(p)}>
                      <MdEdit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(p._id)}>
                      <MdDelete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Button variant="outlined" disabled={currentPage === 1} onClick={handlePrevPage}>
            Previous
          </Button>
          <Typography>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button variant="outlined" disabled={currentPage === totalPages} onClick={handleNextPage}>
            Next
          </Button>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
