/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const ExcelUploadComponent = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'info' });
  const [products, setProducts] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch actual categories and subcategories from your API
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    // Fetch categories and subcategories from your API
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/category/getcategories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchSubCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/subcategory/');
        const data = await response.json();
        if (data.success) {
          setSubCategories(data.subCategories || []);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchCategories();
    fetchSubCategories();
  }, []);

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar({ open: false, message: '', type: 'info' }), 5000);
  };

  // Utility function to validate Excel file format
  const validateExcelFile = (file) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const validExtensions = ['.xls', '.xlsx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
  };

  // Function to download template Excel file
  const downloadTemplate = () => {
    // Get first category and subcategory IDs for the template
    const firstCategoryId = categories.length > 0 ? categories[0]._id : 'CATEGORY_ID_HERE';
    const firstSubCategoryId = subCategories.length > 0 ? subCategories[0]._id : 'SUBCATEGORY_ID_HERE';
    
    const template = [
      {
        "Name": "Sample Product 1",
        "Product Name": "Sample Product Name",
        "Category ID": firstCategoryId,
        "Sub Category ID": firstSubCategoryId,
        "Unit": "piece",
        "Pack": "1",
        "Description": "Sample product description",
        "Stock": 100,
        "Original Price": 1000,
        "Discounted MRP": 900,
        "Rating": 4.5,
        "Images": "https://example.com/image1.jpg,https://example.com/image2.jpg",
        "Brand": "Sample Brand",
        "Expiry": "2025-12-31"
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products Template");
    XLSX.writeFile(wb, "products_template.xlsx");
    showSnackbar("Template downloaded successfully!", "success");
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!validateExcelFile(file)) {
      showSnackbar("Please upload a valid Excel file (.xls or .xlsx)", "error");
      event.target.value = '';
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showSnackbar("File size too large. Please upload a file smaller than 5MB", "error");
      event.target.value = '';
      return;
    }

    setIsProcessing(true);
    setUploadStatus('Reading file...');
    setUploadProgress(10);

    try {
      setUploadStatus('Processing Excel data...');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      if (!workbook.SheetNames.length) {
        showSnackbar("Excel file has no sheets", "error");
        return;
      }
      
      setUploadProgress(30);
      setUploadStatus('Extracting data from sheets...');
      
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { 
        defval: "", // Default value for empty cells
        header: 1   // Use first row as header
      });

      if (!rows.length || rows.length < 2) { // At least header + 1 data row
        showSnackbar("Excel file empty or has no data rows", "warning");
        return;
      }

      setUploadProgress(50);
      setUploadStatus('Validating data structure...');

      // Remove header row and filter out completely empty rows
      const dataRows = rows.slice(1).filter(row => 
        Object.values(row).some(cell => cell !== "" && cell != null)
      );

      if (!dataRows.length) {
        showSnackbar("No valid data rows found in Excel file", "warning");
        return;
      }

      // Convert array format back to object format with headers
      const headers = rows[0];
      const jsonRows = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || "";
        });
        return obj;
      });

      // Validate required columns
      const requiredColumns = ["Name", "Category ID"];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        showSnackbar(
          `Missing required columns: ${missingColumns.join(", ")}`, 
          "error"
        );
        return;
      }

      setUploadProgress(70);
      setUploadStatus(`Processing ${jsonRows.length} products...`);
      showSnackbar(`Found ${jsonRows.length} rows to process...`, "info");

      // Create ID mappings for validation
      const categoryIdMap = {};
      categories.forEach(cat => {
        if (cat && cat._id) {
          categoryIdMap[cat._id] = true;
        }
      });

      const subCategoryIdMap = {};
      subCategories.forEach(sub => {
        if (sub && sub._id) {
          subCategoryIdMap[sub._id] = true;
        }
      });

      const processedProducts = jsonRows.map((row, i) => {
        // Handle undefined/null row data safely
        const categoryId = row["Category ID"]?.toString()?.trim() || "";
        const subCategoryId = row["Sub Category ID"]?.toString()?.trim() || "";

        // Validate category and subcategory IDs
        const isValidCategory = categoryId && categoryIdMap[categoryId];
        const isValidSubCategory = !subCategoryId || (subCategoryId && subCategoryIdMap[subCategoryId]);

        if (!isValidCategory) {
          console.warn(`Category ID "${categoryId}" not found in database for product: ${row["Name"] || `Row ${i + 1}`}`);
        }
        if (!isValidSubCategory && subCategoryId) {
          console.warn(`SubCategory ID "${subCategoryId}" not found in database for product: ${row["Name"] || `Row ${i + 1}`}`);
        }

        // Calculate discount and amountSaving based on prices
        const originalPrice = Number(row["Original Price"]) || 0;
        const discountedMRP = Number(row["Discounted MRP"]) || originalPrice;
        const discount = originalPrice > 0 
          ? Math.round(((originalPrice - discountedMRP) / originalPrice) * 100) 
          : 0;
        const amountSaving = originalPrice - discountedMRP;

        return {
          name: row["Name"]?.toString()?.trim() || `Unnamed-${i + 1}`,
          productName: row["Product Name"]?.toString()?.trim() || "",
          category: isValidCategory ? [categoryId] : [],
          subCategory: isValidSubCategory && subCategoryId ? [subCategoryId] : [],
          unit: row["Unit"]?.toString()?.trim() || "",
          pack: row["Pack"]?.toString()?.trim() || "",
          description: row["Description"]?.toString()?.trim() || "",
          stock: Number(row["Stock"]) || 0,
          price: discountedMRP,
          originalPrice: originalPrice,
          discountedMRP: discountedMRP,
          discount: discount,
          amountSaving: amountSaving,
          rating: Number(row["Rating"]) || 0,
          images: row["Images"]
            ? row["Images"].toString().split(",").map((u) => u.trim()).filter(url => url.length > 0)
            : [],
          more_details: {
            brand: row["Brand"]?.toString()?.trim() || "",
            expiry: row["Expiry"]?.toString()?.trim() || "",
          },
        };
      });

      setUploadProgress(80);
      setUploadStatus('Validating product data...');

      // Validate products before processing
      const validProducts = [];
      const invalidProducts = [];

      processedProducts.forEach((product, index) => {
        const errors = [];
        
        // Required field validations
        if (!product.name || product.name === `Unnamed-${index + 1}`) {
          errors.push("Product name is required");
        }
        
        if (product.category.length === 0) {
          errors.push("Valid category ID is required");
        }
        
        if (product.stock < 0) {
          errors.push("Stock cannot be negative");
        }
        
        if (product.originalPrice < 0) {
          errors.push("Original price cannot be negative");
        }
        
        if (product.discountedMRP < 0) {
          errors.push("Discounted MRP cannot be negative");
        }
        
        if (product.rating < 0 || product.rating > 5) {
          errors.push("Rating must be between 0 and 5");
        }

        if (errors.length > 0) {
          invalidProducts.push({
            row: index + 1,
            product: product.name,
            errors: errors
          });
        } else {
          validProducts.push(product);
        }
      });

      // Show validation results
      if (invalidProducts.length > 0) {
        console.warn("Invalid products found:", invalidProducts);
        const errorMessage = `Found ${invalidProducts.length} invalid products. Check console for details.`;
        showSnackbar(errorMessage, "warning");
      }

      if (validProducts.length === 0) {
        showSnackbar("No valid products found in Excel file", "error");
        return;
      }

      setUploadProgress(90);
      setIsProcessing(false);
      setIsUploading(true);
      setUploadStatus(`Uploading ${validProducts.length} products to server...`);

      // Real API call
      try {
        const response = await fetch('http://localhost:8000/api/product/bulk-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization if needed:
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            products: validProducts
          })
        });

        const result = await response.json();

        if (!response.ok) {
          // Handle validation errors
          if (result.errors && Array.isArray(result.errors)) {
            console.error("Validation errors:", result.errors);
            showSnackbar(
              `Upload failed: ${result.errors.length} validation errors found. Check console for details.`,
              "error"
            );
          } else {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
          }
          return;
        }
        
        if (result.success) {
          setUploadProgress(100);
          setUploadStatus('Upload completed successfully!');
          showSnackbar(
            `Successfully uploaded ${result.created} products!`, 
            "success"
          );
          
          // Update local state with populated data from API
          setProducts(prevProducts => [...prevProducts, ...result.data]);
          event.target.value = '';
          setTimeout(() => {
            setUploadProgress(0);
            setUploadStatus('');
          }, 2000);
        } else {
          throw new Error(result.message || 'Failed to create products');
        }
        
      } catch (apiError) {
        console.error("API Error:", apiError);
        showSnackbar(
          `Failed to save products: ${apiError.message}`, 
          "error"
        );
      }

    } catch (error) {
      console.error("Error processing Excel file:", error);
      showSnackbar("Error processing Excel file: " + error.message, "error");
      event.target.value = '';
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const getSnackbarColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-500 text-green-700';
      case 'error': return 'bg-red-100 border-red-500 text-red-700';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default: return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  const getStatusColor = () => {
    if (isProcessing) return 'text-blue-600';
    if (isUploading) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Excel Product Upload</h2>
      
      {/* Snackbar */}
      {snackbar.open && (
        <div className={`mb-4 p-4 border-l-4 rounded ${getSnackbarColor(snackbar.type)}`}>
          {snackbar.message}
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Upload Products Excel File</h3>
          
          <div className="mb-4">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
              disabled={categories.length === 0 || isProcessing || isUploading}
            >
              Download Template
            </button>
            
            <label className={`px-4 py-2 rounded cursor-pointer ${
              isProcessing || isUploading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}>
              Choose Excel File
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                disabled={isProcessing || isUploading}
                className="hidden"
              />
            </label>
          </div>

          {categories.length === 0 && (
            <p className="text-yellow-600 mb-2">
              Loading categories... Please wait before downloading template.
            </p>
          )}

          {/* Status Message */}
          {(isProcessing || isUploading || uploadStatus) && (
            <div className={`mb-4 p-3 rounded-lg ${getStatusColor()} bg-gray-50`}>
              <div className="flex items-center justify-center">
                {(isProcessing || isUploading) && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span className="font-medium">{uploadStatus}</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isProcessing ? 'bg-blue-600' : 'bg-green-600'
                }`}
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <div className="text-xs text-gray-500 mt-1">
                {uploadProgress}% complete
              </div>
            </div>
          )}

          {/* Processing/Uploading Indicators */}
          <div className="flex justify-center space-x-4 mt-4">
            {isProcessing && (
              <div className="flex items-center text-blue-600">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                <span>Processing File</span>
              </div>
            )}
            {isUploading && (
              <div className="flex items-center text-green-600">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                <span>Uploading to Server</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">
          Uploaded Products ({products.length})
        </h3>
        
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {product.category[0]?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      ₹{product.price || product.discountedMRP || product.originalPrice}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {product.rating}/5
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No products uploaded yet. Download the template and upload your Excel file.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExcelUploadComponent;