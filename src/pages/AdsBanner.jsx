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

// Red button styles
const redButtonStyle = {
  bgcolor: '#dc2626',
  color: 'white',
  '&:hover': {
    bgcolor: '#b91c1c',
  },
};

// ----------------------------------------------------------
// ✅ Upload Area Component
// ----------------------------------------------------------
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
  <Card
    sx={{
      height: "100%",
      border: "2px dashed #e5e7eb",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}
  >
    <CardContent
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
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
            <Typography variant="subtitle1" fontWeight="600" color="#1f2937">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        {isEmpty && <Chip label="Empty" size="small" sx={{ color: "#6b7280", borderColor: "#d1d5db" }} variant="outlined" />}
      </Box>

      {/* Upload Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          border: "2px dashed #e5e7eb",
          borderRadius: 2,
          backgroundColor: "#f9fafb",
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
                color: "#9ca3af",
                mb: 1,
                backgroundColor: "#f3f4f6",
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
            <Typography variant="h6" color="#374151" gutterBottom>
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
            ...redButtonStyle,
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

// ----------------------------------------------------------
// ✅ Main Component
// ----------------------------------------------------------
export default function BannerManager() {
  const [banner, setBanner] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch banner
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

  // Upload to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.secure_url;
  };

  // Save banners
  const handleSubmit = async (values) => {
    try {
      await axios.post(`${BANNER_API_URL}/create-or-update`, values);
      setSnackbar({ open: true, message: "✅ Banner saved successfully", severity: "success" });
      fetchBanner();
    } catch (error) {
      console.error("Error saving banner:", error);
      setSnackbar({ open: true, message: "❌ Error saving banner", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" color="#1f2937" gutterBottom>
          Banner Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your homepage and advertisement banners
        </Typography>
      </Box>

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
            const handleImageUpload = async (event, fieldName, multiple = false) => {
              const { files } = event.target;
              if (!files.length) return;

              setUploading(true);
              try {
                if (multiple) {
                  const urls = await Promise.all(
                    Array.from(files).map((file) => uploadImageToCloudinary(file))
                  );
                  setFieldValue(fieldName, [...(values[fieldName] || []), ...urls]);
                } else {
                  const url = await uploadImageToCloudinary(files[0]);
                  setFieldValue(fieldName, url);
                }
                setSnackbar({ open: true, message: "Image uploaded successfully", severity: "success" });
              } catch {
                setSnackbar({ open: true, message: "Error uploading image", severity: "error" });
              } finally {
                setUploading(false);
              }
            };

            const removeAdvertiseBanner = (index) => {
              setFieldValue(
                "advertiseBanners",
                values.advertiseBanners.filter((_, i) => i !== index)
              );
            };

            return (
              <Form>
                <Grid container spacing={3}>
                  {[1, 2, 3, 4].map((n) => (
                    <Grid item xs={12} md={6} key={n}>
                      <UploadArea
                        title={`Home Banner ${n}`}
                        subtitle="Main page banner"
                        hasImage={!!values[`homeBanner${n}`]}
                        imageUrl={values[`homeBanner${n}`]}
                        isEmpty={!values[`homeBanner${n}`]}
                        onUpload={(e) => handleImageUpload(e, `homeBanner${n}`)}
                        isUploading={uploading}
                      />
                    </Grid>
                  ))}

                  {/* Advertisement banners */}
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        border: "2px dashed #e5e7eb",
                        backgroundColor: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 3,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                backgroundColor: "#f3f4f6",
                                borderRadius: 1,
                                p: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 28,
                                height: 28,
                                color: "#6b7280",
                                fontWeight: "bold",
                                fontSize: 10,
                              }}
                            >
                              ADS
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600" color="#1f2937">
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
                            sx={{ color: "#6b7280", borderColor: "#d1d5db" }}
                            variant="outlined"
                          />
                        </Box>

                        <Box
                          sx={{
                            minHeight: 250,
                            border: "2px dashed #e5e7eb",
                            borderRadius: 2,
                            backgroundColor: "#f9fafb",
                            p: 3,
                            position: "relative",
                          }}
                        >
                          {values.advertiseBanners?.length ? (
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
                          ) : (
                            <Box sx={{ textAlign: "center" }}>
                              <Box
                                sx={{
                                  fontSize: 40,
                                  color: "#9ca3af",
                                  mb: 1,
                                  backgroundColor: "#f3f4f6",
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
                              <Typography variant="h6" color="#374151" gutterBottom>
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
                              ...redButtonStyle,
                              position: values.advertiseBanners?.length ? "absolute" : "static",
                              bottom: values.advertiseBanners?.length ? 16 : "auto",
                              right: values.advertiseBanners?.length ? 16 : "auto",
                              mt: values.advertiseBanners?.length ? 0 : 2,
                            }}
                          >
                            {values.advertiseBanners?.length ? "Add More" : "Upload Multiple"}
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
                      ...redButtonStyle,
                      px: 4,
                      py: 1.5,
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