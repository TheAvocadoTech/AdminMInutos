import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';


// import Category from 'src/pages/Category';

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const Category = lazy(() => import('src/pages/Category'));
export const Banner=lazy(()=>import('src/pages/AdsBanner'))
export const SubCategory=lazy(()=>import('src/pages/SubCategory'))
export const Product =lazy(()=>import('src/pages/ProductData'))
export const OrderPage=lazy(()=>import('src/sections/user/view/order-page'))
export const Vendor=lazy(()=>import('src/pages/VendorList'))

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <IndexPage />, index: true },
        { path: 'user', element: <UserPage /> },
        { path: 'Banner', element: <Banner /> },
        { path: 'Category', element: <Category /> },
        {path:'subcategory',element:<SubCategory/>},

        { path: 'products', element: <Product/> },
        { path: 'VendorList', element: <Vendor/> },
        {path:'order', element:<OrderPage/>},
        { path: 'blog', element: <BlogPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
     {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
