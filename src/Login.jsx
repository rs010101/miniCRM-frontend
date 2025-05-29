import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // Define callback first so it's available to `script.onload`
  async function handleCredentialResponse(response) {
    console.log("Google credential response:", response);
    if (!response.credential) {
      alert("Failed to get Google credential token");
      return;
    }

    try {
      const res = await fetch("https://minicrm-backend-1.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      console.log("Response from backend:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        alert("Authentication failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    }
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      /* global google */
      if (window.google) {
        google.accounts.id.initialize({
          client_id: "1055844706813-ipblp1kihl1ln1von5lp8vn1mq1sf472.apps.googleusercontent.com", // Replace with your actual Client ID
          callback: handleCredentialResponse,
        });

        google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: "300",
          }
        );
      } else {
        console.error("Google API failed to load.");
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-primary-800 mb-2">Mini CRM Platform</h1>
        <p className="text-gray-600 mb-8">
          AI-driven customer insights and automated campaign management for smarter business growth
        </p>
        <div id="googleSignInDiv" className="flex justify-center"></div>
        <p className="text-xs text-gray-400 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
