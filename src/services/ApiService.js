// services/analyticsService.js

const API_BASE_URL = 'https://api.minutos.in/api';

export const analyticsService = {
  getAnalyticsCounts: async () => {
    try {
      // Fetch categories
      const categoryRes = await fetch(`${API_BASE_URL}/category/categories`);
      const categoryData = await categoryRes.json();
      const categoryCount = categoryData?.categories?.length || 0;

      // Fetch subcategories
      const subcategoryRes = await fetch(`${API_BASE_URL}/subcategory`);
      const subcategoryData = await subcategoryRes.json();
      const subcategoryCount = subcategoryData?.subcategories?.length || 0;

      // Fetch products
      const productRes = await fetch(`${API_BASE_URL}/product/`);
      const productData = await productRes.json();
      const productCount = productData?.data?.length || 0; // <-- FIXED

      // Return all counts
      return {
        categories: categoryCount,
        subcategories: subcategoryCount,
        products: productCount,
      };
    } catch (error) {
      console.error('Error fetching analytics counts:', error);
      return {
        categories: 0,
        subcategories: 0,
        products: 0,
      };
    }
  },
};
