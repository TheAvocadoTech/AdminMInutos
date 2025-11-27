
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */import React, { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Iconify from "src/components/iconify";
import { analyticsService}  from "src/services/ApiService";
import AppTasks from "../app-tasks";
import AppNewsUpdate from "../app-news-update";
import AppOrderTimeline from "../app-order-timeline";
import AppCurrentVisits from "../app-current-visits";
import AppWebsiteVisits from "../app-website-visits";
import AppWidgetSummary from "../app-widget-summary";
import AppTrafficBySite from "../app-traffic-by-site";
import AppCurrentSubject from "../app-current-subject";
import AppConversionRates from "../app-conversion-rates";


// ----------------------------------------------------------------------

export default function AppView() {
  const [counts, setCounts] = useState({
    categories: 0,
    subcategories: 0,
    products: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const data = await analyticsService.getAnalyticsCounts();
      setCounts(data);
    };
    fetchCounts();
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Category Count */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Categories"
            total={counts.categories}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        {/* Subcategory Count */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Subcategories"
            total={counts.subcategories}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        {/* Product Count */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Products"
            total={counts.products}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        {/* Placeholder for Bug Reports or another metric */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Bug Reports"
            total={234}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        {/* Example charts (can replace later with real analytics) */}
       <Grid xs={12} md={6} lg={8}>
  <AppWebsiteVisits
    title="Monthly Grocery Orders Overview (India)"
    subheader="(+35%) growth in grocery orders YoY"
    chart={{
      labels: [
        "Jan 2024",
        "Feb 2024",
        "Mar 2024",
        "Apr 2024",
        "May 2024",
        "Jun 2024",
        "Jul 2024",
        "Aug 2024",
        "Sep 2024",
        "Oct 2024",
        "Nov 2024",
      ],
      series: [
        {
          name: "Quick Commerce (Instant Delivery)",
          type: "column",
          fill: "solid",
          data: [2800, 3100, 3400, 3900, 4400, 4800, 5200, 5600, 6100, 6700, 7200],
        },
        {
          name: "E-commerce (Scheduled Delivery)",
          type: "area",
          fill: "gradient",
          data: [2200, 2400, 2700, 3100, 3400, 3700, 4100, 4500, 4900, 5200, 5600],
        },
        {
          name: "Repeat Grocery Buyers",
          type: "line",
          fill: "solid",
          data: [700, 850, 950, 1100, 1300, 1550, 1700, 1850, 2000, 2300, 2500],
        },
      ],
    }}
  />
</Grid>

<Grid xs={12} md={6} lg={4}>
  <AppCurrentVisits
    title="Grocery Order Distribution by Indian Region"
    chart={{
      series: [
        { label: "North India (Delhi, Punjab, UP)", value: 6200 },
        { label: "South India (Bangalore, Chennai, Hyderabad)", value: 7800 },
        { label: "West India (Mumbai, Pune, Gujarat)", value: 6900 },
        { label: "East India (Kolkata, Odisha, Assam)", value: 3600 },
      ],
    }}
  />
</Grid>

<Grid xs={12} md={6} lg={8}>
  <AppConversionRates
    title="Top-Selling Grocery Categories (India)"
    subheader="Conversion and demand across major grocery types"
    chart={{
      series: [
        { label: "Fresh Fruits & Vegetables", value: 1280 },
        { label: "Dairy & Bakery", value: 1150 },
        { label: "Packaged Food", value: 990 },
        { label: "Beverages", value: 870 },
        { label: "Snacks & Munchies", value: 910 },
        { label: "Atta, Rice & Dal", value: 1030 },
        { label: "Household Essentials", value: 760 },
        { label: "Oils & Masalas", value: 850 },
        { label: "Frozen & Ready-to-Eat", value: 640 },
        { label: "Baby Food & Care", value: 530 },
      ],
    }}
  />
</Grid>

<Grid xs={12} md={6} lg={4}>
  <AppCurrentSubject
    title="Customer Behavior (Grocery Buyers)"
    chart={{
      categories: [
        "Cart Abandonment Rate",
        "Avg. Basket Value (₹)",
        "Repeat Purchase Rate",
        "Delivery Speed Satisfaction",
        "Freshness Rating",
        "Refund / Replacement Requests",
      ],
      series: [
        {
          name: "Quick Commerce",
          data: [35, 520, 78, 92, 88, 8],
        },
        {
          name: "E-commerce",
          data: [48, 880, 65, 84, 80, 14],
        },
        {
          name: "Overall (India)",
          data: [41, 680, 71, 88, 84, 11],
        },
      ],
    }}
  />
</Grid>

        

        

        

        
      </Grid>
    </Container>
  );
}
