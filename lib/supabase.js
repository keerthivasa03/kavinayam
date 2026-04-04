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
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZ3JtdWhlYWxmZXpzbmlraWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjI1MDQsImV4cCI6MjA4OTM5ODUwNH0.pM35kzYHb1CH14laLv2Q3ifFFKMKekTGR1Tp0qsRx48";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
