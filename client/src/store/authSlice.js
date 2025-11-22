import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { API_ROUTES } from "../utils/constant";
import { toast } from "react-hot-toast";

// Login User
export const loginUser = createAsyncThunk(
  "auth/login",
  async (creds, { rejectWithValue }) => {
    try {
      const { data } = await api.post(API_ROUTES.LOGIN, creds);
      toast.success("Welcome back!");
      return data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

// Register User
export const registerUser = createAsyncThunk(
  "auth/register",
  async (creds, { rejectWithValue }) => {
    try {
      const { data } = await api.post(API_ROUTES.REGISTER, creds);
      toast.success("Account created! Verify email.");
      return data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

// Check Auth & Fetch Profile (Fix for Name showing)
export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Check if token is valid
      await api.post(API_ROUTES.CHECK_AUTH);

      // 2. If valid, fetch full user profile to get Name & Image
      const { data } = await api.get("/user/profile");
      return data.user;
    } catch (error) {
      return rejectWithValue("Unauthorized");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await api.post(API_ROUTES.LOGOUT);
  toast.success("Logged out");
});

// Update Profile in Redux state locally after editing
export const updateLocalUser = createAsyncThunk(
  "auth/updateLocal",
  async (userData) => {
    return userData;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Handle local profile update
      .addCase(updateLocalUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export default authSlice.reducer;
