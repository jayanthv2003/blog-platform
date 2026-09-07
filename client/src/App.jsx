import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Loader from './components/Loader';

// Route-level code splitting: each page ships as its own chunk and is only
// downloaded when the user navigates to it, instead of one large bundle.
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Categories = lazy(() => import('./pages/Categories'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const EditPost = lazy(() => import('./pages/EditPost'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const AuthorProfile = lazy(() => import('./pages/AuthorProfile'));
const MyPosts = lazy(() => import('./pages/MyPosts'));
const SavedPosts = lazy(() => import('./pages/SavedPosts'));
const LikedPosts = lazy(() => import('./pages/LikedPosts'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/ManageUsers'));
const ManagePosts = lazy(() => import('./pages/ManagePosts'));
const ManageComments = lazy(() => import('./pages/ManageComments'));
const ManageCategories = lazy(() => import('./pages/ManageCategories'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<Loader fullscreen label="Loading" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/author/:id" element={<AuthorProfile />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Authenticated routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/write" element={<CreatePost />} />
              <Route path="/edit-post/:id" element={<EditPost />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-posts" element={<MyPosts />} />
              <Route path="/saved-posts" element={<SavedPosts />} />
              <Route path="/liked-posts" element={<LikedPosts />} />
            </Route>

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="posts" element={<ManagePosts />} />
                <Route path="comments" element={<ManageComments />} />
                <Route path="categories" element={<ManageCategories />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
