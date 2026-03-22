import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
import { supabase } from '@/integrations/supabase/client'

async function testConnection() {
  const { data, error } = await supabase.from('items').select('*')
  console.log('DATA:', data)
  console.log('ERROR:', error)
}

testConnection()