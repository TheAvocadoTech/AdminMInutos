/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import axios from 'axios';
import { useState, useEffect, useMemo } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ✅ Enhanced Dummy Orders with Complete Details
const dummyOrders = [
  {
    _id: 'ORD001234',
    orderNumber: 'MIN-2025-001234',
    user: { 
      name: 'Amit Sharma',
      email: 'amit.sharma@gmail.com',
      phone: '+91 98765 43210'
    },
    vendor: { 
      shopName: 'Fresh Mart Grocery',
      ownerName: 'Rajesh Kumar',
      phone: '+91 98111 22333',
      address: 'Shop 12, Main Market, Narnaund'
    },
    deliveryAddress: {
      street: 'House No. 45, Sector 3',
      area: 'Gandhi Nagar',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Near SBI Bank'
    },
    items: [
      { name: 'Red Apples (Kashmir)', qty: 2, unit: 'kg', price: 180 },
      { name: 'Fresh Bananas', qty: 6, unit: 'dozen', price: 60 },
      { name: 'Orange Juice', qty: 1, unit: 'ltr', price: 120 },
    ],
    subtotal: 360,
    deliveryCharge: 30,
    tax: 19.5,
    discount: 40,
    total: 369.5,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
    deliveryDate: '2025-09-03T15:30:00Z',
    createdAt: '2025-09-01T10:00:00Z',
    notes: 'Please deliver before 4 PM'
  },
  {
    _id: 'ORD001235',
    orderNumber: 'MIN-2025-001235',
    user: { 
      name: 'Priya Verma',
      email: 'priya.verma@outlook.com',
      phone: '+91 97654 32109'
    },
    vendor: { 
      shopName: 'Daily Needs Store',
      ownerName: 'Suresh Gupta',
      phone: '+91 98222 44555',
      address: 'Near Bus Stand, Narnaund'
    },
    deliveryAddress: {
      street: 'Flat 201, Green Apartments',
      area: 'Model Town',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Opposite Police Station'
    },
    items: [
      { name: 'Amul Taaza Milk', qty: 2, unit: 'ltr', price: 54 },
      { name: 'Brown Bread', qty: 1, unit: 'pack', price: 45 },
      { name: 'Fresh Eggs', qty: 12, unit: 'pcs', price: 72 },
    ],
    subtotal: 171,
    deliveryCharge: 20,
    tax: 8.55,
    discount: 15,
    total: 184.55,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Pending',
    deliveryDate: null,
    createdAt: '2025-09-10T14:30:00Z',
    notes: 'Morning delivery preferred'
  },
  {
    _id: 'ORD001236',
    orderNumber: 'MIN-2025-001236',
    user: { 
      name: 'Rahul Mehta',
      email: 'rahul.mehta@yahoo.com',
      phone: '+91 96543 21098'
    },
    vendor: { 
      shopName: 'Organic Hub',
      ownerName: 'Pankaj Singh',
      phone: '+91 98333 55666',
      address: 'Shop 5, Health Plaza, Narnaund'
    },
    deliveryAddress: {
      street: 'Villa 23, Palm Gardens',
      area: 'Extension Area',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Behind City Hospital'
    },
    items: [
      { name: 'Organic Brown Rice', qty: 5, unit: 'kg', price: 350 },
      { name: 'Extra Virgin Olive Oil', qty: 1, unit: 'ltr', price: 650 },
      { name: 'Quinoa Seeds', qty: 1, unit: 'kg', price: 280 },
    ],
    subtotal: 1280,
    deliveryCharge: 50,
    tax: 64,
    discount: 100,
    total: 1294,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delievered',
    deliveryDate: "25/05/2025",
    createdAt: '2025-09-12T18:45:00Z',
    notes: 'Customer requested cancellation - quality concerns'
  },
  {
    _id: 'ORD001237',
    orderNumber: 'MIN-2025-001237',
    user: { 
      name: 'Sneha Patel',
      email: 'sneha.patel@gmail.com',
      phone: '+91 95432 10987'
    },
    vendor: { 
      shopName: 'Spice Garden',
      ownerName: 'Vinod Sharma',
      phone: '+91 98444 77888',
      address: 'Shop 8, Masala Market, Narnaund'
    },
    deliveryAddress: {
      street: '123, Old Railway Road',
      area: 'Station Area',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Near Railway Crossing'
    },
    items: [
      { name: 'Turmeric Powder (Organic)', qty: 500, unit: 'gm', price: 85 },
      { name: 'Red Chili Powder', qty: 500, unit: 'gm', price: 120 },
      { name: 'Coriander Seeds', qty: 250, unit: 'gm', price: 45 },
      { name: 'Garam Masala', qty: 200, unit: 'gm', price: 95 },
    ],
    subtotal: 345,
    deliveryCharge: 25,
    tax: 17.25,
    discount: 30,
    total: 357.25,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Processing',
    deliveryDate: null,
    createdAt: '2025-09-13T09:15:00Z',
    notes: 'Pack spices separately'
  },
  {
    _id: 'ORD001238',
    orderNumber: 'MIN-2025-001238',
    user: { 
      name: 'Vikram Singh',
      email: 'vikram.singh@hotmail.com',
      phone: '+91 94321 09876'
    },
    vendor: { 
      shopName: 'Bakery Delight',
      ownerName: 'Mohit Bakshi',
      phone: '+91 98555 88999',
      address: 'Shop 15, Market Complex, Narnaund'
    },
    deliveryAddress: {
      street: 'B-45, Shastri Nagar',
      area: 'Civil Lines',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Near Gurudwara'
    },
    items: [
      { name: 'Whole Wheat Bread', qty: 2, unit: 'pack', price: 45 },
      { name: 'Chocolate Cookies', qty: 3, unit: 'pack', price: 60 },
      { name: 'Butter Croissant', qty: 4, unit: 'pcs', price: 120 },
    ],
    subtotal: 225,
    deliveryCharge: 20,
    tax: 11.25,
    discount: 20,
    total: 236.25,
    paymentMethod: 'Debit Card',
    paymentStatus: 'Paid',
    status: 'Shipped',
    deliveryDate: null,
    createdAt: '2025-09-12T16:20:00Z',
    notes: 'Early morning delivery needed'
  },
  {
    _id: 'ORD001239',
    orderNumber: 'MIN-2025-001239',
    user: { 
      name: 'Anjali Desai',
      email: 'anjali.desai@gmail.com',
      phone: '+91 93210 98765'
    },
    vendor: { 
      shopName: 'Veggie Fresh',
      ownerName: 'Ramesh Yadav',
      phone: '+91 98666 11222',
      address: 'Shop 3, Vegetable Market, Narnaund'
    },
    deliveryAddress: {
      street: 'House 67, Rajiv Colony',
      area: 'New Housing Board',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Near Water Tank'
    },
    items: [
      { name: 'Fresh Tomatoes', qty: 2, unit: 'kg', price: 80 },
      { name: 'Green Capsicum', qty: 1, unit: 'kg', price: 60 },
      { name: 'Onions', qty: 3, unit: 'kg', price: 90 },
      { name: 'Potatoes', qty: 5, unit: 'kg', price: 150 },
      { name: 'Fresh Coriander', qty: 100, unit: 'gm', price: 20 },
    ],
    subtotal: 400,
    deliveryCharge: 25,
    tax: 20,
    discount: 35,
    total: 410,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
    deliveryDate: '2025-09-14T10:15:00Z',
    createdAt: '2025-09-14T08:00:00Z',
    notes: 'Select fresh vegetables only'
  },
  {
    _id: 'ORD001240',
    orderNumber: 'MIN-2025-001240',
    user: { 
      name: 'Karan Malhotra',
      email: 'karan.malhotra@rediffmail.com',
      phone: '+91 92109 87654'
    },
    vendor: { 
      shopName: 'Tech Gadgets Store',
      ownerName: 'Anil Kumar',
      phone: '+91 98777 33444',
      address: 'Shop 22, Electronics Market, Narnaund'
    },
    deliveryAddress: {
      street: 'Flat 305, Sky Towers',
      area: 'Industrial Area',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Near Factory Gate 2'
    },
    items: [
      { name: 'USB Type-C Cable', qty: 2, unit: 'pcs', price: 400 },
      { name: 'Wireless Mouse', qty: 1, unit: 'pc', price: 550 },
      { name: 'Phone Case', qty: 1, unit: 'pc', price: 299 },
    ],
    subtotal: 1249,
    deliveryCharge: 40,
    tax: 62.45,
    discount: 125,
    total: 1226.45,
    paymentMethod: 'Net Banking',
    paymentStatus: 'Paid',
    status: 'Processing',
    deliveryDate: null,
    createdAt: '2025-09-15T11:30:00Z',
    notes: 'Fragile items - handle with care'
  },
  {
    _id: 'ORD001241',
    orderNumber: 'MIN-2025-001241',
    user: { 
      name: 'Deepika Rao',
      email: 'deepika.rao@gmail.com',
      phone: '+91 91098 76543'
    },
    vendor: { 
      shopName: 'Beauty & Care',
      ownerName: 'Priya Singhal',
      phone: '+91 98888 55666',
      address: 'Shop 18, Main Road, Narnaund'
    },
    deliveryAddress: {
      street: '89, Teacher Colony',
      area: 'School Road',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Behind Government School'
    },
    items: [
      { name: 'Face Wash (Himalaya)', qty: 2, unit: 'bottle', price: 240 },
      { name: 'Hair Oil (Parachute)', qty: 1, unit: 'bottle', price: 180 },
      { name: 'Body Lotion', qty: 1, unit: 'bottle', price: 350 },
      { name: 'Shampoo (Dove)', qty: 1, unit: 'bottle', price: 285 },
    ],
    subtotal: 1055,
    deliveryCharge: 30,
    tax: 52.75,
    discount: 105,
    total: 1032.75,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Shipped',
    deliveryDate: null,
    createdAt: '2025-09-14T13:45:00Z',
    notes: 'Gift wrap requested'
  },
  {
    _id: 'ORD001242',
    orderNumber: 'MIN-2025-001242',
    user: { 
      name: 'Sanjay Khanna',
      email: 'sanjay.khanna@yahoo.in',
      phone: '+91 90987 65432'
    },
    vendor: { 
      shopName: 'Books & Stationery',
      ownerName: 'Ashok Verma',
      phone: '+91 98999 77888',
      address: 'Shop 7, Book Market, Narnaund'
    },
    deliveryAddress: {
      street: 'C-12, Student Hostel',
      area: 'College Road',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Near Degree College'
    },
    items: [
      { name: 'Notebooks (200 pages)', qty: 5, unit: 'pcs', price: 275 },
      { name: 'Gel Pens (Blue)', qty: 10, unit: 'pcs', price: 100 },
      { name: 'A4 Papers (500 sheets)', qty: 1, unit: 'ream', price: 280 },
      { name: 'Calculator', qty: 1, unit: 'pc', price: 450 },
    ],
    subtotal: 1105,
    deliveryCharge: 35,
    tax: 55.25,
    discount: 110,
    total: 1085.25,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Pending',
    deliveryDate: null,
    createdAt: '2025-09-15T15:20:00Z',
    notes: 'Deliver to hostel security'
  },
  {
    _id: 'ORD001243',
    orderNumber: 'MIN-2025-001243',
    user: { 
      name: 'Meera Iyer',
      email: 'meera.iyer@gmail.com',
      phone: '+91 89876 54321'
    },
    vendor: { 
      shopName: 'Pet Paradise',
      ownerName: 'Gopal Das',
      phone: '+91 98111 99000',
      address: 'Shop 11, Animal Care Market, Narnaund'
    },
    deliveryAddress: {
      street: 'Bungalow 5, Green Valley',
      area: 'Farmhouse Area',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Near Petrol Pump'
    },
    items: [
      { name: 'Dog Food (Pedigree)', qty: 3, unit: 'kg', price: 900 },
      { name: 'Cat Litter', qty: 2, unit: 'kg', price: 320 },
      { name: 'Pet Shampoo', qty: 1, unit: 'bottle', price: 280 },
      { name: 'Chew Toys', qty: 4, unit: 'pcs', price: 400 },
    ],
    subtotal: 1900,
    deliveryCharge: 50,
    tax: 95,
    discount: 190,
    total: 1855,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
    deliveryDate: '2025-09-16T14:00:00Z',
    createdAt: '2025-09-15T09:30:00Z',
    notes: 'Call before delivery - dogs at home'
  },
  {
    _id: 'ORD001244',
    orderNumber: 'MIN-2025-001244',
    user: { 
      name: 'Arjun Reddy',
      email: 'arjun.reddy@outlook.com',
      phone: '+91 88765 43210'
    },
    vendor: { 
      shopName: 'Sports Zone',
      ownerName: 'Rohit Sharma',
      phone: '+91 98222 88999',
      address: 'Shop 20, Stadium Road, Narnaund'
    },
    deliveryAddress: {
      street: 'D-78, Sports Complex',
      area: 'Stadium Area',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Inside Sports Complex Gate 1'
    },
    items: [
      { name: 'Cricket Bat (SS)', qty: 1, unit: 'pc', price: 3500 },
      { name: 'Cricket Ball (Leather)', qty: 3, unit: 'pcs', price: 900 },
      { name: 'Batting Gloves', qty: 1, unit: 'pair', price: 1200 },
      { name: 'Helmet', qty: 1, unit: 'pc', price: 2200 },
    ],
    subtotal: 7800,
    deliveryCharge: 80,
    tax: 390,
    discount: 780,
    total: 7490,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Processing',
    deliveryDate: null,
    createdAt: '2025-09-16T10:00:00Z',
    notes: 'Urgent delivery needed for match'
  },
  {
    _id: 'ORD001245',
    orderNumber: 'MIN-2025-001245',
    user: { 
      name: 'Kavita Joshi',
      email: 'kavita.joshi@gmail.com',
      phone: '+91 87654 32109'
    },
    vendor: { 
      shopName: 'Home Decor Palace',
      ownerName: 'Manish Agarwal',
      phone: '+91 98333 66777',
      address: 'Shop 25, Furniture Market, Narnaund'
    },
    deliveryAddress: {
      street: 'Plot 45, Royal Residency',
      area: 'VIP Road',
      city: 'Narnaund',
      state: 'Haryana',
      pincode: '125039',
      landmark: 'Near Club House'
    },
    items: [
      { name: 'Wall Clock (Wooden)', qty: 1, unit: 'pc', price: 850 },
      { name: 'Decorative Vase', qty: 2, unit: 'pcs', price: 1200 },
      { name: 'Photo Frames', qty: 5, unit: 'pcs', price: 750 },
      { name: 'Table Lamp', qty: 2, unit: 'pcs', price: 1600 },
    ],
    subtotal: 4400,
    deliveryCharge: 60,
    tax: 220,
    discount: 440,
    total: 4240,
    paymentMethod: 'Debit Card',
    paymentStatus: 'Paid',
    status: 'Shipped',
    deliveryDate: null,
    createdAt: '2025-09-15T17:45:00Z',
    notes: 'Fragile - pack with bubble wrap'
  },
];

// Custom Chip for Order Status
const StatusChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Shipped':
        return 'primary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor()}
      variant="outlined"
      size="small"
      sx={{ 
        fontWeight: 'medium',
        borderRadius: 1,
        px: 0.5
      }}
    />
  );
};

// Custom Table Row for Orders with all details
const OrderTableRow = ({ 
  row, 
  selected, 
  handleClick 
}) => {
  const isItemSelected = selected.indexOf(row._id) !== -1;
  
  return (
    <TableRow hover role="checkbox" tabIndex={-1} selected={isItemSelected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isItemSelected}
          onChange={(event) => handleClick(event, row._id)}
        />
      </TableCell>
      
      {/* Order ID & Number */}
      <TableCell>
        <Typography variant="body2" fontWeight="600" color="primary">
          {row.orderNumber}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {row._id}
        </Typography>
      </TableCell>
      
      {/* Customer Details */}
      <TableCell>
        <Typography variant="body2" fontWeight="600">
          {row.user?.name || 'Unknown'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {row.user?.email || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.user?.phone || 'N/A'}
        </Typography>
      </TableCell>
      
      {/* Vendor Details */}
      <TableCell>
        <Typography variant="body2" fontWeight="600">
          {row.vendor?.shopName || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Owner: {row.vendor?.ownerName || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.vendor?.phone || 'N/A'}
        </Typography>
      </TableCell>
      
      {/* Vendor Address */}
      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 200 }}>
          {row.vendor?.address || 'N/A'}
        </Typography>
      </TableCell>
      
      {/* Delivery Address */}
      <TableCell>
        <Typography variant="body2" fontWeight="500">
          {row.deliveryAddress?.street}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {row.deliveryAddress?.area}, {row.deliveryAddress?.city}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.deliveryAddress?.state} - {row.deliveryAddress?.pincode}
        </Typography>
        {row.deliveryAddress?.landmark && (
          <Typography variant="caption" color="info.main" display="block">
            Near: {row.deliveryAddress?.landmark}
          </Typography>
        )}
      </TableCell>
      
      {/* Items Details */}
      <TableCell>
        <Typography variant="body2" fontWeight="600" color="primary">
          {row.items?.length || 0} Items
        </Typography>
        {row.items?.slice(0, 2).map((item, idx) => (
          <Typography key={idx} variant="caption" color="text.secondary" display="block">
            • {item.name} ({item.qty} {item.unit})
          </Typography>
        ))}
        {row.items?.length > 2 && (
          <Typography variant="caption" color="info.main">
            +{row.items.length - 2} more
          </Typography>
        )}
      </TableCell>
      
      {/* Pricing Details */}
      <TableCell>
        <Typography variant="body2" fontWeight="600" color="success.main">
          Total: ₹{row.total?.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Subtotal: ₹{row.subtotal?.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Delivery: ₹{row.deliveryCharge?.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Tax: ₹{row.tax?.toFixed(2)}
        </Typography>
        {row.discount > 0 && (
          <Typography variant="caption" color="error.main" display="block">
            Discount: -₹{row.discount?.toFixed(2)}
          </Typography>
        )}
      </TableCell>
      
      {/* Payment Details */}
      <TableCell>
        <Typography variant="body2" fontWeight="600">
          {row.paymentMethod}
        </Typography>
        <Chip 
          label={row.paymentStatus}
          size="small"
          color={row.paymentStatus === 'Paid' ? 'success' : row.paymentStatus === 'Pending' ? 'warning' : 'error'}
          sx={{ mt: 0.5 }}
        />
      </TableCell>
      
      {/* Order Status */}
      <TableCell align="center">
        <StatusChip status={row.status} />
      </TableCell>
      
      {/* Dates */}
      <TableCell>
        <Typography variant="body2" fontWeight="600">
          Order Date:
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {new Date(row.createdAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
        {row.deliveryDate && (
          <>
            <Typography variant="body2" fontWeight="600" sx={{ mt: 1 }}>
              Delivered:
            </Typography>
            <Typography variant="caption" color="success.main">
              {new Date(row.deliveryDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
          </>
        )}
      </TableCell>
      
      {/* Notes */}
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 150 }}>
          {row.notes || 'No notes'}
        </Typography>
      </TableCell>
      
      {/* Actions */}
      <TableCell align="right">
        <Button size="small" variant="outlined">
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};

// Custom filter function that works with all fields
const applyFilterCustom = ({ inputData, comparator, filterName }) => {
  if (!filterName) {
    return [...inputData].sort(comparator);
  }

  const searchQuery = filterName.toLowerCase().trim();
  
  // Filter orders based on multiple fields
  const filteredData = inputData.filter((order) => {
    // Check customer details
    const customerMatch = 
      (order.user?.name || '').toLowerCase().includes(searchQuery) ||
      (order.user?.email || '').toLowerCase().includes(searchQuery) ||
      (order.user?.phone || '').toLowerCase().includes(searchQuery);
    
    // Check vendor details
    const vendorMatch = 
      (order.vendor?.shopName || '').toLowerCase().includes(searchQuery) ||
      (order.vendor?.ownerName || '').toLowerCase().includes(searchQuery) ||
      (order.vendor?.phone || '').toLowerCase().includes(searchQuery) ||
      (order.vendor?.address || '').toLowerCase().includes(searchQuery);
    
    // Check order details
    const orderMatch = 
      (order.orderNumber || '').toLowerCase().includes(searchQuery) ||
      (order._id || '').toLowerCase().includes(searchQuery);
    
    // Check delivery address
    const addressMatch = 
      (order.deliveryAddress?.street || '').toLowerCase().includes(searchQuery) ||
      (order.deliveryAddress?.area || '').toLowerCase().includes(searchQuery) ||
      (order.deliveryAddress?.city || '').toLowerCase().includes(searchQuery) ||
      (order.deliveryAddress?.state || '').toLowerCase().includes(searchQuery) ||
      (order.deliveryAddress?.pincode || '').toLowerCase().includes(searchQuery) ||
      (order.deliveryAddress?.landmark || '').toLowerCase().includes(searchQuery);
    
    // Check payment and status
    const paymentMatch = 
      (order.paymentMethod || '').toLowerCase().includes(searchQuery) ||
      (order.paymentStatus || '').toLowerCase().includes(searchQuery) ||
      (order.status || '').toLowerCase().includes(searchQuery);
    
    // Check order items
    const itemsMatch = order.items?.some(item => 
      (item.name || '').toLowerCase().includes(searchQuery)
    ) || false;
    
    // Check notes
    const notesMatch = (order.notes || '').toLowerCase().includes(searchQuery);
    
    return customerMatch || vendorMatch || orderMatch || addressMatch || 
           paymentMatch || itemsMatch || notesMatch;
  });
  
  return filteredData.sort(comparator);
};

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Orders (or use dummy if API fails)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://backend.minutos.shop/api/orders');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setOrders(res.data);
        } else {
          setOrders(dummyOrders); // fallback
        }
      } catch (err) {
        console.error('Error fetching orders, using dummy data:', err);
        setOrders(dummyOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Sorting
  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  // Select All
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = orders.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // Select One
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // Filtering
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  // Get comparator for sorting
  const comparator = getComparator(order, orderBy);
  
  // Apply filtering and sorting using custom function
  const dataFiltered = useMemo(() => {
    return applyFilterCustom({
      inputData: orders,
      comparator,
      filterName,
    });
  }, [orders, comparator, filterName]);

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" sx={{ 
          color: 'text.primary',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          Orders Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Orders: {orders.length}
        </Typography>
      </Stack>

      <Card sx={{ 
        borderRadius: 2,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {loading && <LinearProgress />}
        
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          placeholder="Search orders, customers, or vendors..."
        />

        <Scrollbar>
          <TableContainer sx={{ 
            overflow: 'unset',
            minHeight: loading ? 400 : 'unset'
          }}>
            <Table sx={{ minWidth: 2000 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={orders.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'orderNumber', label: 'Order Number', align: 'left' },
                  { id: 'customer', label: 'Customer Details', align: 'left' },
                  { id: 'vendor', label: 'Vendor Details', align: 'left' },
                  { id: 'vendorAddress', label: 'Vendor Address', align: 'left' },
                  { id: 'deliveryAddress', label: 'Delivery Address', align: 'left' },
                  { id: 'items', label: 'Order Items', align: 'left' },
                  { id: 'pricing', label: 'Pricing Details', align: 'left' },
                  { id: 'payment', label: 'Payment Info', align: 'left' },
                  { id: 'status', label: 'Status', align: 'center' },
                  { id: 'dates', label: 'Dates', align: 'left' },
                  { id: 'notes', label: 'Notes', align: 'left' },
                  { id: 'actions', label: 'Actions', align: 'right' },
                ]}
              />
              <TableBody>
                {!loading && dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <OrderTableRow
                      key={row._id}
                      row={row}
                      selected={selected}
                      handleClick={handleClick}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
                />

                {notFound && <TableNoData query={filterName} />}
                
                {loading && (
                  <TableBody>
                    <TableEmptyRows height={300} emptyRows={5} />
                  </TableBody>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        />
      </Card>
    </Container>
  );
}