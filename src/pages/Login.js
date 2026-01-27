"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    AdminMail: "",
    Password: "",
    captchaInput: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // Fetch CAPTCHA from server
  const fetchCaptcha = async () => {
    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/auth/captcha.php",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setCaptchaText(data.captcha);
        setCaptchaError("");
      } else {
        throw new Error("Failed to load CAPTCHA");
      }
    } catch (err) {
      setCaptchaError("Failed to load CAPTCHA. Please refresh the page.");
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For demo: allow any credentials
      const demoUser = {
        AdminId: 1,
        AdminMail: "demo@system.com",
        AdminName: "Demo User",
        OfficeId: 1,
        OfficeCode: "HO",
        Role: "Admin",
        sessionToken: "demo-token-123",
      };

      localStorage.setItem("user", JSON.stringify(demoUser));
      localStorage.setItem("sessionToken", demoUser.sessionToken);

      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError("");
    setForgotPasswordMessage("");

    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email address");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/auth/forget_password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotPasswordEmail,
          }),
        }
      );
      const result = await response.json();

      if (result.success) {
        setForgotPasswordMessage(
          result.message ||
            "Password reset instructions have been sent to your email."
        );
        setForgotPasswordEmail("");
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordMessage("");
        }, 5000);
      } else {
        setForgotPasswordError(
          result.message || "Failed to send password reset email."
        );
      }
    } catch (err) {
      setForgotPasswordError("Network error. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 h-screen items-center place-items-center">
      <div className="w-full max-w-md space-y-8 p-10 rounded-lg">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src={require("../assets/logo.png") || "/placeholder.svg"}
            alt="Your Company"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            INVENTORY MANAGEMENT SYSTEM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <span className="font-medium text-indigo-600 hover:text-indigo-500">
              {showForgotPassword
                ? "RESET YOUR PASSWORD"
                : "LOGIN YOUR ACCOUNT"}
            </span>
          </p>
        </div>

        {!showForgotPassword ? (
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
            noValidate
          >
            {/* Multiple hidden decoy fields to confuse autofill */}
            <div style={{ display: "none" }}>
              <input type="text" name="fakeusernameremembered" />
              <input type="password" name="fakepasswordremembered" />
              <input type="email" name="fake_email" tabIndex="-1" />
              <input type="password" name="fake_password" tabIndex="-1" />
            </div>

            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="AdminMail" className="sr-only">
                  Email address
                </label>
                <input
                  id="AdminMail"
                  name="AdminMail"
                  type="email"
                  autoComplete="nope"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  required
                  readOnly
                  onFocus={(e) => {
                    e.target.removeAttribute("readOnly");
                    // Clear any autofilled value
                    setTimeout(() => {
                      if (e.target.value !== form.AdminMail) {
                        e.target.value = form.AdminMail;
                      }
                    }, 100);
                  }}
                  onBlur={(e) => e.target.setAttribute("readOnly", true)}
                  className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Email address"
                  value={form.AdminMail}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="Password" className="sr-only">
                  Password
                </label>
                <input
                  id="Password"
                  name="Password"
                  type="password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  required
                  readOnly
                  onFocus={(e) => {
                    e.target.removeAttribute("readOnly");
                    // Clear any autofilled value
                    setTimeout(() => {
                      if (e.target.value !== form.Password) {
                        e.target.value = form.Password;
                      }
                    }, 100);
                  }}
                  onBlur={(e) => e.target.setAttribute("readOnly", true)}
                  className="relative block w-full border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Password"
                  value={form.Password}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="captcha"
                    className="block text-sm font-medium text-gray-700"
                  >
                    CAPTCHA Verification
                  </label>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="text-xs text-indigo-600 hover:text-indigo-500"
                    disabled={loading}
                  >
                    Refresh CAPTCHA
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-100 p-2 rounded-md text-center font-mono text-lg tracking-widest select-none relative">
                    <div className="absolute inset-0 backdrop-blur-[1px] bg-white/30"></div>
                    <span className="relative z-10">
                      {captchaText || "Loading..."}
                    </span>
                  </div>
                  <input
                    id="captchaInput"
                    name="captchaInput"
                    type="text"
                    autoComplete="off"
                    required
                    className="flex-1 relative block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter CAPTCHA"
                    value={form.captchaInput}
                    onChange={handleInputChange}
                  />
                </div>
                {captchaError && (
                  <p className="mt-1 text-red-500 text-sm">{captchaError}</p>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                disabled={loading || !captchaText}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label
                htmlFor="forgotPasswordEmail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter your email address
              </label>
              <input
                id="forgotPasswordEmail"
                type="email"
                required
                className="relative block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
              />
            </div>

            {forgotPasswordError && (
              <p className="text-red-500 text-sm">{forgotPasswordError}</p>
            )}
            {forgotPasswordMessage && (
              <p className="text-green-500 text-sm">{forgotPasswordMessage}</p>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Login
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-500"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}