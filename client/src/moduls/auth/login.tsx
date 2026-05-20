import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import axios from "axios";
import { useAppDispatch } from "../../redux/hooks";
import { loginSuccess } from "../../redux/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
   const dispatch = useAppDispatch();
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Email Validation
  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return '';
  };

  // Password Validation
  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return "Password must contain both letters and numbers";
    }
    return '';
  };

  // Handle Input Changes with Live Validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError
    });

    // Stop if validation fails
    if (emailError || passwordError) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log("Login successful:", response.data);
      if (response.data.accessToken) {
        document.cookie = `accessToken=${response.data.accessToken}; path=/; max-age=86400; SameSite=Strict`;
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
          dispatch(
      loginSuccess({
            user: response.data.user,
            accessToken: response.data.accessToken,
          })
    );
      toast.success("Login successful");
      if (response.data.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/productlist');
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Invalid email or password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 font-sans overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-violet-700 opacity-20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-indigo-500 opacity-15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-900 opacity-10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-lg shadow-violet-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to continue to your workspace</p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  className={`w-full bg-white/[0.05] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-white/[0.1] focus:border-violet-500/60 focus:bg-white/[0.07]'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full bg-white/[0.05] border rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-white/[0.1] focus:border-violet-500/60 focus:bg-white/[0.07]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-3.5 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
            >
              <span className={`flex items-center justify-center gap-2 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Sign in
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs text-zinc-600">or continue with</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-600">
          Don't have an account?{' '}
          <a href="/register">
            Create one free
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;