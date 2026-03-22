import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
// Use the relative path to avoid the '@' error
import { supabase } from './integrations/supabase/client';

async function testConnection() {
  try {
    const { data, error } = await supabase.from('items').select('*').limit(1);
    
    if (error) {
      alert("❌ CONNECTION ERROR: " + error.message);
    } else {
      alert("✅ SUCCESS: Connected to DearBonitar Database!");
      console.log("Items found:", data);
    }
  } catch (err) {
    alert("⚠️ SYSTEM ERROR: The supabase client could not initialize. Check your .env keys.");
  }
}

testConnection();
