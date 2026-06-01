import { Platform } from "react-native";

const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export const API_BASE_URL = RAW_API_URL.endsWith('/') 
  ? RAW_API_URL.slice(0, -1) 
  : RAW_API_URL;