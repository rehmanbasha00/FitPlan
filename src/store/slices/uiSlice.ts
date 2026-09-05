import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isCreateTripOpen: boolean;
  editingTripId: string | null;
  deletingTripId: string | null;
  isNotificationsOpen: boolean;
  isProfileMenuOpen: boolean;
}

const initialState: UiState = {
  isCreateTripOpen: false,
  editingTripId: null,
  deletingTripId: null,
  isNotificationsOpen: false,
  isProfileMenuOpen: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCreateTrip(state) {
      state.isCreateTripOpen = true;
    },
    closeCreateTrip(state) {
      state.isCreateTripOpen = false;
    },
    openEditTrip(state, action: PayloadAction<string>) {
      state.editingTripId = action.payload;
    },
    closeEditTrip(state) {
      state.editingTripId = null;
    },
    openDeleteTrip(state, action: PayloadAction<string>) {
      state.deletingTripId = action.payload;
    },
    closeDeleteTrip(state) {
      state.deletingTripId = null;
    },
    toggleNotifications(state) {
      state.isNotificationsOpen = !state.isNotificationsOpen;
      state.isProfileMenuOpen = false;
    },
    toggleProfileMenu(state) {
      state.isProfileMenuOpen = !state.isProfileMenuOpen;
      state.isNotificationsOpen = false;
    },
    closeMenus(state) {
      state.isNotificationsOpen = false;
      state.isProfileMenuOpen = false;
    }
  }
});

export const {
  openCreateTrip,
  closeCreateTrip,
  openEditTrip,
  closeEditTrip,
  openDeleteTrip,
  closeDeleteTrip,
  toggleNotifications,
  toggleProfileMenu,
  closeMenus
} = uiSlice.actions;
export default uiSlice.reducer;
