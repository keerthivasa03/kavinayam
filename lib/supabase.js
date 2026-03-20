// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://nzqsbjdatsehpcgijiue.supabase.co";
// const supabaseAnonKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cXNiamRhdHNlaHBjZ2lqaXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTMzNDcsImV4cCI6MjA2MDcyOTM0N30.OY5V0XZHVYdBN9sccFuuRGhsYUE--Rx8uvryedbtnMc";

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto"; // required for Supabase auth

const supabaseUrl = "https://klgrmuhealfezsnikiid.supabase.co";
const supabaseAnonKey =
  "sb_publishable_-55w6AEXniLmQ2-qWzA6Fg_plOn3ibc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
