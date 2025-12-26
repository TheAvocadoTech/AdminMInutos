/* eslint-disable react/prop-types */
/* eslint-disable */
import { Field, FieldArray, Formik, Form } from "formik";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";

// Import services
import { getCategories } from "src/services/categoryService";
import { getSubCategories } from "src/services/SubcategoryService";
import { createProduct, deleteProduct, getProduct, updateProduct } from "src/services/ProductService";

// Cloudinary configuration
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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null, productName: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    if (editingProduct?.category?.[0]?._id) {
      filterSubCategories(editingProduct.category[0]._id);
    }
  }, [editingProduct]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, subData, prodData] = await Promise.all([
          getCategories(),
          getSubCategories(),
          getProduct(),
        ]);
        setCategories(catData.categories || []);
        setSubCategories(subData.subcategories || []);
        setProducts(prodData.data || []);
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

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId) => {
    setDeleteDialog({ 
      open: true, 
      productId, 
      productName: products.find(p => p._id === productId)?.productName || "this product" 
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteDialog.productId);
      setProducts(prev => prev.filter(p => p._id !== deleteDialog.productId));
      showSnackbar("Product deleted successfully");
      setDeleteDialog({ open: false, productId: null, productName: "" });
      
      // Adjust current page if needed
      if (currentProducts.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete product", "error");
    }
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setSubmitting(true);
    setLoading(true);

    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct._id, values);

        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProduct._id
              ? {
                  ...res.product,
                  category: res.product.category || editingProduct.category,
                  subCategory: res.product.subCategory || editingProduct.subCategory,
                }
              : p
          )
        );

        showSnackbar("Product updated successfully");
      } else {
        const res = await createProduct(values);
        setProducts((prev) => [res.product, ...prev]);
        showSnackbar("Product added successfully");
      }

      resetForm();
      setEditingProduct(null);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showSnackbar("Error saving product", "error");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const handleNextPage = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Product Management
      </Typography>

      {editingProduct && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Editing: {editingProduct.productName || editingProduct.name}
          <Button size="small" onClick={handleCancelEdit} sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        </Alert>
      )}

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
        {({ values, errors, touched, setFieldValue, handleChange, isSubmitting, resetForm }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Left Form */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="black" gutterBottom>
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
                        error={touched.category && !!errors.category}
                        helperText={touched.category && errors.category}
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
                  <Typography variant="h6" color="black" gutterBottom>
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
                  <Typography variant="h6" color="black" gutterBottom>
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
                          sx={redOutlinedButtonStyle}
                        >
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
                  <Typography variant="h6" color="black" gutterBottom>
                    Pricing
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField 
                        name="stock" 
                        label="Stock" 
                        type="number" 
                        fullWidth 
                        value={values.stock} 
                        onChange={handleChange} 
                      />
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
                      <TextField 
                        name="price" 
                        label="Final Price" 
                        fullWidth 
                        value={values.price} 
                        InputProps={{ readOnly: true }} 
                      />
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

            <Box textAlign="center" mt={4} display="flex" justifyContent="center" gap={2}>
              {editingProduct && (
                <Button 
                  type="button" 
                  variant="outlined" 
                  onClick={() => {
                    resetForm();
                    setEditingProduct(null);
                  }}
                  sx={redOutlinedButtonStyle}
                >
                  Cancel Edit
                </Button>
              )}
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isSubmitting || loading} 
                size="large"
                sx={redButtonStyle}
              >
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
              {currentProducts.length > 0 ? (
                currentProducts.map((p) => (
                  <TableRow key={p._id} hover>
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
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(p)}
                        title="Edit"
                      >
                        <MdEdit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(p._id)}
                        title="Delete"
                      >
                        <MdDelete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {products.length > 0 && (
          <Box mt={2} mb={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
            <Button 
              variant="outlined" 
              disabled={currentPage === 1} 
              onClick={handlePrevPage}
              sx={redOutlinedButtonStyle}
            >
              Previous
            </Button>
            <Typography>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button 
              variant="outlined" 
              disabled={currentPage === totalPages} 
              onClick={handleNextPage}
              sx={redOutlinedButtonStyle}
            >
              Next
            </Button>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, productId: null, productName: "" })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.productName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, productId: null, productName: "" })}
            sx={redOutlinedButtonStyle}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained"
            sx={redButtonStyle}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}