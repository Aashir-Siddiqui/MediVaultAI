import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { API_ROUTES } from "../utils/constant";
import { toast } from "react-hot-toast";

// Fetch all family members
export const fetchFamily = createAsyncThunk(
  "family/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ROUTES.GET_FAMILY);
      return data.familyMembers;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch family members"
      );
    }
  }
);

// Add family member
export const addFamilyMember = createAsyncThunk(
  "family/add",
  async (memberData, { rejectWithValue }) => {
    try {
      console.log("Adding family member:", memberData);
      const { data } = await api.post(API_ROUTES.ADD_FAMILY, memberData);
      toast.success("Family member added successfully!");
      return data.familyMember;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to add family member";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update family member
export const updateFamilyMember = createAsyncThunk(
  "family/update",
  async ({ id, memberData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/family/${id}`, memberData);
      toast.success("Family member updated successfully!");
      return data.familyMember;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update family member";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete family member
export const deleteFamilyMember = createAsyncThunk(
  "family/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/family/${id}`);
      toast.success("Family member deleted successfully!");
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete family member";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Upload family member image
export const uploadFamilyMemberImage = createAsyncThunk(
  "family/uploadImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const { data } = await api.post(`/family/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile image updated!");
      return { id, profileImage: data.profileImage };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload image";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const familySlice = createSlice({
  name: "family",
  initialState: {
    members: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch family
      .addCase(fetchFamily.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFamily.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchFamily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add family member
      .addCase(addFamilyMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFamilyMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.unshift(action.payload);
      })
      .addCase(addFamilyMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update family member
      .addCase(updateFamilyMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFamilyMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.members.findIndex(
          (m) => m._id === action.payload._id
        );
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(updateFamilyMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete family member
      .addCase(deleteFamilyMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m._id !== action.payload);
      })

      // Upload image
      .addCase(uploadFamilyMemberImage.fulfilled, (state, action) => {
        const index = state.members.findIndex(
          (m) => m._id === action.payload.id
        );
        if (index !== -1) {
          state.members[index].profileImage = action.payload.profileImage;
        }
      });
  },
});

export const { clearError } = familySlice.actions;
export default familySlice.reducer;
