
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
            title="Website Visits"
            subheader="(+43%) than last year"
            chart={{
              labels: [
                "01/01/2003",
                "02/01/2003",
                "03/01/2003",
                "04/01/2003",
                "05/01/2003",
                "06/01/2003",
                "07/01/2003",
                "08/01/2003",
                "09/01/2003",
                "10/01/2003",
                "11/01/2003",
              ],
              series: [
                {
                  name: "Team A",
                  type: "column",
                  fill: "solid",
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: "Team B",
                  type: "area",
                  fill: "gradient",
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: "Team C",
                  type: "line",
                  fill: "solid",
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Current Visits"
            chart={{
              series: [
                { label: "America", value: 4344 },
                { label: "Asia", value: 5435 },
                { label: "Europe", value: 1443 },
                { label: "Africa", value: 4443 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppConversionRates
            title="Conversion Rates"
            subheader="(+43%) than last year"
            chart={{
              series: [
                { label: "Italy", value: 400 },
                { label: "Japan", value: 430 },
                { label: "China", value: 448 },
                { label: "Canada", value: 470 },
                { label: "France", value: 540 },
                { label: "Germany", value: 580 },
                { label: "South Korea", value: 690 },
                { label: "Netherlands", value: 1100 },
                { label: "United States", value: 1200 },
                { label: "United Kingdom", value: 1380 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentSubject
            title="Current Subject"
            chart={{
              categories: [
                "English",
                "History",
                "Physics",
                "Geography",
                "Chinese",
                "Math",
              ],
              series: [
                { name: "Series 1", data: [80, 50, 30, 40, 100, 20] },
                { name: "Series 2", data: [20, 30, 40, 80, 20, 80] },
                { name: "Series 3", data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid>

        

        

        

        
      </Grid>
    </Container>
  );
}
