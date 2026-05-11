import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout }   from "./pages/Layout";
import { Home }     from "./pages/Home";
import { Single }   from "./pages/Single";
import { Demo }     from "./pages/Demo";
import { Signup }   from "./pages/Signup";
import { Login }    from "./pages/Login";
import { Settings } from "./pages/Settings";
import { Profile }  from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes — no navbar */}
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes — need to be logged in */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
        errorElement={<h1>Not found!</h1>}
      >
        <Route path="/"         element={<Home />} />
        <Route path="/profile"  element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/single/:theId" element={<Single />} />
        <Route path="/demo"     element={<Demo />} />
      </Route>
    </>
  )
);