// ─────────────────────────────────────────
// Tawfeer — Supabase Client
// ─────────────────────────────────────────

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseKey  = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Register a new user ──────────────────
async function registerUser({ name, email, emirate }) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, emirate }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Duplicate email — fetch existing user
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      return { user: existing, isNew: false };
    }
    throw error;
  }
  return { user: data, isNew: true };
}

// ── Log a prevented trip ────────────────
async function logTrip({ userId, questionAsked, centerName, distanceKm, co2Kg, fuelLiters, moneyAed, emirate }) {
  const { data, error } = await supabase
    .from('trips_prevented')
    .insert([{
      user_id:       userId,
      question_asked: questionAsked,
      center_name:   centerName,
      distance_km:   distanceKm,
      co2_kg:        co2Kg,
      fuel_liters:   fuelLiters,
      money_aed:     moneyAed,
      emirate:       emirate
    }])
    .select()
    .single();

  if (error) throw error;

  // Update cumulative counter
  await supabase.rpc('increment_impact', {
    p_km:  distanceKm,
    p_co2: co2Kg
  });

  return data;
}

// ── Get cumulative impact ───────────────
async function getCumulativeImpact() {
  const { data, error } = await supabase
    .from('cumulative_impact')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) throw error;
  return data;
}

// ── Get all users (admin) ───────────────
async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, emirate, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ── Get all trips (admin) ───────────────
async function getAllTrips() {
  const { data, error } = await supabase
    .from('trips_prevented')
    .select('*, users(name, emirate)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  registerUser,
  logTrip,
  getCumulativeImpact,
  getAllUsers,
  getAllTrips
};
