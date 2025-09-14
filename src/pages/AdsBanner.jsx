/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import axios from "axios";
import { Formik, Form } from "formik";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
  Chip,
} from "@mui/material";

const BANNER_API_URL = "https://backend.minutos.shop/api/ads";
const CLOUDINARY_UPLOAD_PRESET = "marketdata";
const CLOUDINARY_CLOUD_NAME = "de4ks8mkh";

/* ✅ UploadArea moved to top-level (outside BannerManager) */
export const UploadArea = ({
  title,
  subtitle,
  onUpload,
  hasImage,
  imageUrl,
  multiple = false,
  isEmpty = true,
  isUploading,
}) => (
  <Card sx={{ height: "100%", border: "2px dashed #e0e0e0", backgroundColor: "#fafafa" }}>
    <CardContent
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              borderRadius: "4px",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            IMG
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        {isEmpty && <Chip label="Empty" size="small" color="default" variant="outlined" />}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          border: "2px dashed #ddd",
          borderRadius: 2,
          backgroundColor: "#f9f9f9",
          position: "relative",
        }}
      >
        {hasImage && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8,
              maxHeight: 200,
            }}
          />
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                fontSize: 40,
                color: "#1976d2",
                mb: 1,
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                fontWeight: "bold",
              }}
            >
              ↑
            </Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Upload Banner
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag & drop or click to select
            </Typography>
          </Box>
        )}

        <Button
          component="label"
          variant="contained"
          disabled={isUploading}
          sx={{
            position: hasImage && imageUrl ? "absolute" : "static",
            bottom: hasImage && imageUrl ? 10 : "auto",
            right: hasImage && imageUrl ? 10 : "auto",
            mt: hasImage && imageUrl ? 0 : 2,
          }}
        >
          {hasImage && imageUrl ? "Change" : "Upload"}
          <input type="file" accept="image/*" hidden multiple={multiple} onChange={onUpload} />
        </Button>
      </Box>
    </CardContent>
  </Card>
);

/* ✅ Main component */
export default function BannerManager() {
  const [banner, setBanner] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch Banner (single doc)
  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BANNER_API_URL}/get`);
      setBanner(res.data.banner || null);
    } catch (error) {
      console.error("Error fetching banner:", error);
      setSnackbar({ open: true, message: "Error fetching banner", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
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

  // Handle form submit (create/update banner)
  const handleSubmit = async (values) => {
    try {
      await axios.post(`${BANNER_API_URL}/create-or-update`, values);
      setSnackbar({ open: true, message: "Banner saved successfully", severity: "success" });
      fetchBanner();
    } catch (error) {
      console.error("Error saving banner:", error);
      setSnackbar({ open: true, message: "Error saving banner", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Banner Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your home page and advertisement banners
        </Typography>
      </Box>

      {(!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please configure Cloudinary settings.
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Formik
          initialValues={{
            homeBanner1: banner?.homeBanner1 || "",
            advertiseBanners: banner?.advertiseBanners || [],
            homeBanner2: banner?.homeBanner2 || "",
            homeBanner3: banner?.homeBanner3 || "",
            homeBanner4: banner?.homeBanner4 || "",
          }}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => {
            
            // Handle image upload (moved inside Formik render to access values)
            const handleImageUpload = async (event, fieldName, multiple = false) => {
              const { files } = event.target;
              if (!files || files.length === 0) return;

              setUploading(true);
              try {
                if (multiple) {
                  const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
                  const urls = await Promise.all(validFiles.map((file) => uploadImageToCloudinary(file)));
                  
                  // Add new images after the existing ones (not at the beginning)
                  setFieldValue(fieldName, [...(values[fieldName] || []), ...urls]);
                } else {
                  const file = files[0];
                  if (!file.type.startsWith("image/")) {
                    setSnackbar({
                      open: true,
                      message: "Invalid image file",
                      severity: "error",
                    });
                    return;
                  }
                  const url = await uploadImageToCloudinary(file);
                  setFieldValue(fieldName, url);
                }
                setSnackbar({
                  open: true,
                  message: "Image uploaded successfully",
                  severity: "success",
                });
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: error.message || "Failed to upload image",
                  severity: "error",
                });
              } finally {
                setUploading(false);
              }
            };

            // Remove advertisement banner
            const removeAdvertiseBanner = (indexToRemove) => {
              const updatedBanners = values.advertiseBanners.filter((_, index) => index !== indexToRemove);
              setFieldValue("advertiseBanners", updatedBanners);
            };

            return (
              <Form>
                <Grid container spacing={3}>
                  {/* Home Banner 1 */}
                  <Grid item xs={12} md={6}>
                    <UploadArea
                      title="Home Banner 1"
                      subtitle="Main page banner"
                      hasImage={!!values.homeBanner1}
                      imageUrl={values.homeBanner1}
                      isEmpty={!values.homeBanner1}
                      onUpload={(e) => handleImageUpload(e, "homeBanner1")}
                    />
                  </Grid>

                  {/* Home Banner 2 */}
                  <Grid item xs={12} md={6}>
                    <UploadArea
                      title="Home Banner 2"
                      subtitle="Main page banner"
                      hasImage={!!values.homeBanner2}
                      imageUrl={values.homeBanner2}
                      isEmpty={!values.homeBanner2}
                      onUpload={(e) => handleImageUpload(e, "homeBanner2")}
                    />
                  </Grid>

                  {/* Home Banner 3 */}
                  <Grid item xs={12} md={6}>
                    <UploadArea
                      title="Home Banner 3"
                      subtitle="Main page banner"
                      hasImage={!!values.homeBanner3}
                      imageUrl={values.homeBanner3}
                      isEmpty={!values.homeBanner3}
                      onUpload={(e) => handleImageUpload(e, "homeBanner3")}
                    />
                  </Grid>

                  {/* Home Banner 4 */}
                  <Grid item xs={12} md={6}>
                    <UploadArea
                      title="Home Banner 4"
                      subtitle="Main page banner"
                      hasImage={!!values.homeBanner4}
                      imageUrl={values.homeBanner4}
                      isEmpty={!values.homeBanner4}
                      onUpload={(e) => handleImageUpload(e, "homeBanner4")}
                    />
                  </Grid>

                  {/* Advertisement Banners */}
                  <Grid item xs={12}>
                    <Card sx={{ border: "2px dashed #e0e0e0", backgroundColor: "#fafafa" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                backgroundColor: "#e3f2fd",
                                borderRadius: 1,
                                p: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 28,
                                height: 28,
                                color: "#1976d2",
                                fontWeight: "bold",
                                fontSize: 10,
                              }}
                            >
                              ADS
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600">
                                Advertisement Banners
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Multiple promotional banners
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={`${values.advertiseBanners?.length || 0} banners`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>

                        <Box
                          sx={{
                            minHeight: 250,
                            border: "2px dashed #ddd",
                            borderRadius: 2,
                            backgroundColor: "#f9f9f9",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 3,
                            position: "relative",
                          }}
                        >
                          {values.advertiseBanners?.length > 0 ? (
                            <Box sx={{ width: "100%" }}>
                              <Grid container spacing={2}>
                                {values.advertiseBanners.map((url, idx) => (
                                  <Grid item xs={6} sm={4} md={3} key={idx}>
                                    <Box sx={{ position: "relative" }}>
                                      <img
                                        src={url}
                                        alt={`Advertisement ${idx + 1}`}
                                        style={{
                                          width: "100%",
                                          height: 120,
                                          objectFit: "cover",
                                          borderRadius: 8,
                                        }}
                                      />
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="error"
                                        sx={{
                                          position: "absolute",
                                          top: 4,
                                          right: 4,
                                          minWidth: 24,
                                          width: 24,
                                          height: 24,
                                          borderRadius: "50%",
                                          fontSize: 12,
                                          fontWeight: "bold",
                                          p: 0,
                                        }}
                                        onClick={() => removeAdvertiseBanner(idx)}
                                      >
                                        ✕
                                      </Button>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: "center" }}>
                              <Box
                                sx={{
                                  fontSize: 40,
                                  color: "#1976d2",
                                  mb: 1,
                                  backgroundColor: "#e3f2fd",
                                  borderRadius: "50%",
                                  width: 60,
                                  height: 60,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mx: "auto",
                                  fontWeight: "bold",
                                }}
                              >
                                ↑
                              </Box>
                              <Typography variant="h6" color="text.primary" gutterBottom>
                                Upload Advertisement Banners
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Select multiple images for advertisement banners
                              </Typography>
                            </Box>
                          )}

                          <Button
                            component="label"
                            variant="contained"
                            disabled={uploading}
                            sx={{
                              position: values.advertiseBanners?.length > 0 ? "absolute" : "static",
                              bottom: values.advertiseBanners?.length > 0 ? 16 : "auto",
                              right: values.advertiseBanners?.length > 0 ? 16 : "auto",
                              mt: values.advertiseBanners?.length > 0 ? 0 : 2,
                            }}
                          >
                            {values.advertiseBanners?.length > 0 ? "Add More" : "Upload Multiple"}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              multiple
                              onChange={(e) => handleImageUpload(e, "advertiseBanners", true)}
                            />
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Save Button */}
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={uploading}
                    sx={{
                      px: 4,
                      py: 1.5,
                      backgroundColor: "#1976d2",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                      },
                    }}
                  >
                    {uploading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        Uploading...
                      </Box>
                    ) : (
                      "Save All Banners"
                    )}
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
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