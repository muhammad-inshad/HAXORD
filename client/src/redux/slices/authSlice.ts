import {createSlice, type PayloadAction} from "@reduxjs/toolkit"

interface AuthState {
  user: any;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false
};

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        loginSuccess: (state, action) => {

  state.user = action.payload.user;

  state.accessToken = action.payload.accessToken;

  state.isAuthenticated = true;
},
        logout:(state)=>{
            state.user=null;
            state.isAuthenticated=false
        }
    }
})

export const{loginSuccess,logout}=authSlice.actions;
export default authSlice.reducer;