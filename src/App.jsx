import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate
} from "react-router-dom";
import { FaChartLine, FaUsers, FaShoppingCart, FaBullhorn } from 'react-icons/fa';

import Dashboard from "./pages/Dashboard";
import Customer from "./pages/customers/customer";
import Orders from "./pages/orders/Orders";
import SegmentRules from "./pages/segmentRules/segmentRules";
import Campaign from "./pages/campaign/campaign";

// ---------------------------------------------
// Login Page Component
// ---------------------------------------------
function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
      return;
    }

    const handleCredentialResponse = async (response) => {
      try {
        const res = await fetch("https://minicrm-backend-1.onrender.com/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/dashboard");
        } else {
          alert("Authentication failed");
        }
      } catch (err) {
        console.error("Login error", err);
        alert("Login failed");
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      /* global google */
      google.accounts.id.initialize({
        client_id: "1055844706813-ipblp1kihl1ln1von5lp8vn1mq1sf472.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("g_id_signin"),
        {
          theme: "filled_black",
          size: "large",
          width: "300",
          shape: "pill",
        }
      );
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate]);

  const features = [
    {
      icon: FaUsers,
      title: "Customer Management",
      description: "Organize and track your customer relationships efficiently"
    },
    {
      icon: FaShoppingCart,
      title: "Order Tracking",
      description: "Monitor and manage customer orders in real-time"
    },
    {
      icon: FaChartLine,
      title: "Analytics",
      description: "Get insights into your business performance"
    },
    {
      icon: FaBullhorn,
      title: "Campaign Management",
      description: "Create and manage targeted marketing campaigns"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mini CRM Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-driven customer insights and automated campaign management for smarter business growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Features List */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Google Login */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
            </div>
            <div id="g_id_signin" className="flex justify-center"></div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Protected Route Wrapper
// ---------------------------------------------
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

// ---------------------------------------------
// App Routes Setup
// ---------------------------------------------
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard user={JSON.parse(localStorage.getItem("user"))} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/segment"
          element={
            <ProtectedRoute>
              <SegmentRules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign"
          element={
            <ProtectedRoute>
              <Campaign />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
