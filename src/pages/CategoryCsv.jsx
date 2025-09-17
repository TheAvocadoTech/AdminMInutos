/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Button, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const API_URL = "https://backend.minutos.shop/api"; // ✅ FIXED

const CSVUploader = ({ onUploadSuccess }) => {
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ Handle CSV Upload
  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_URL}/category/categories/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSnackbar({
        open: true,
        message: "CSV uploaded successfully",
        severity: "success",
      });

      if (onUploadSuccess) onUploadSuccess(); // refresh categories in parent
    } catch (error) {
      console.error("CSV upload error:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload CSV",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Button variant="outlined" component="label">
        Upload CSV
        <input type="file" accept=".csv" hidden onChange={handleCSVUpload} />
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
CSVUploader.propTypes = {
  onUploadSuccess: PropTypes.func,
};

export default CSVUploader;
