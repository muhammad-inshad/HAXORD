import axios from "axios";

export const getCurrentUser=async()=>{
    const response=await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,{withCredentials:true})
      return response.data;
}