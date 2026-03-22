import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
// Using a direct relative path to the client
import { supabase } from './integrations/supabase/client';

// This function will force a popup on your phone screen
async function startSystemCheck() {
  try {
    const { data, error } = await supabase.from('items').select('id').limit(1);
    
    if (error) {
      alert("⚠️ DATABASE ERROR: " + error.message);
    } else {
      alert("✅ CONNECTION SUCCESS! Your database is linked.");
    }
  } catch (err) {
    alert("❌ CRITICAL: The website cannot find your Supabase keys. Check your .env file.");
  }
}

// Start the check
startSystemCheck();

