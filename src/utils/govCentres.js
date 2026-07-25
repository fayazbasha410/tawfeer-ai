// ─────────────────────────────────────────
// Tawfeer — Government Service Centres
// Real addresses + area-to-centre distances
// All 7 Emirates
// ─────────────────────────────────────────

const GOVT_CENTRES = {
  Dubai: [
    {
      id: 'DXB-01',
      name: 'RTA Al Manara Customer Happiness Centre',
      address: 'Al Manara Centre, Sheikh Zayed Road, near Noor Bank Metro Station, Dubai',
      phone: '800 9090',
      hours: 'Mon–Thu 8am–7:30pm | Fri 8am–12pm',
      lat: 25.1697,
      lng: 55.2300,
      areas: ['Al Manara','Al Safa','Jumeirah','Umm Suqeim','Al Wasl','City Walk','Al Quoz','Motor City','Al Barsha South','Sports City','Discovery Gardens','Jumeirah Golf Estates']
    },
    {
      id: 'DXB-02',
      name: 'RTA Al Barsha Customer Happiness Centre',
      address: 'Sheikh Zayed Road, Al Quoz Industrial Area 3, Al Barsha, Dubai',
      phone: '800 9090',
      hours: 'Mon–Thu 8am–7:30pm | Fri 8am–12pm',
      lat: 25.1175,
      lng: 55.1969,
      areas: ['Al Barsha','Al Barsha 1','Al Barsha 2','Al Barsha 3','Al Barsha South','Arjan','Al Quoz Industrial','Dubai Hills','Mudon','Remraam','Damac Hills','Arabian Ranches']
    },
    {
      id: 'DXB-03',
      name: 'RTA Deira Customer Happiness Centre',
      address: 'Behind Dubai Police General HQ, Al Quds Street, Deira, Dubai',
      phone: '800 9090',
      hours: 'Mon–Thu 8am–7:30pm | Fri 8am–12pm',
      lat: 25.2697,
      lng: 55.3094,
      areas: ['Deira','Al Rigga','Al Muteena','Naif','Al Sabkha','Al Baraha','Hor Al Anz','Abu Hail','Al Rashidiya','Airport Area','Al Garhoud','Al Mamzar','Al Nahda Dubai','Mirdif']
    },
    {
      id: 'DXB-04',
      name: 'RTA Al Kifaf Customer Happiness Centre',
      address: 'Near Grand Hyatt Hotel, Sheikh Khalifa Bin Zayed Street, Al Kifaf, Dubai',
      phone: '800 9090',
      hours: '24/7',
      lat: 25.2285,
      lng: 55.3051,
      areas: ['Al Kifaf','Bur Dubai','Karama','Mankhool','Al Raffa','Al Hamriya','Oud Metha','Jaddaf','Al Jadaf','Za\'abeel','World Trade Centre','DIFC','Downtown Dubai','Business Bay']
    },
    {
      id: 'DXB-05',
      name: 'RTA Al Twar Customer Happiness Centre',
      address: '1st Floor, Al Twar Centre, Al Nahda Street, Al Twar 1, Deira, Dubai',
      phone: '800 9090',
      hours: 'Mon–Thu 8am–7:30pm | Fri 8am–12pm',
      lat: 25.2811,
      lng: 55.3622,
      areas: ['Al Twar','Al Nahda','Al Qusais','Al Muhaisnah','Nad Al Sheba','Warqa','Al Mizhar','Mushrif','Mirdif','Al Rashidiya']
    },
    {
      id: 'DXB-06',
      name: 'RTA Umm Ramool Customer Happiness Centre (24/7)',
      address: 'Marrakech Street, opposite Emirates Metro Station, Umm Ramool, Dubai',
      phone: '800 9090',
      hours: '24/7 including holidays',
      lat: 25.2303,
      lng: 55.3580,
      areas: ['Umm Ramool','Al Jaddaf','Al Quoz','Sheikh Zayed Road','Festival City','Garhoud','Port Saeed','Deira City Centre area']
    },
    {
      id: 'DXB-07',
      name: 'RTA Dubai Marina / JBR Service Point',
      address: 'Dubai Marina Mall, Marina Walk, Dubai Marina, Dubai',
      phone: '800 9090',
      hours: 'Mon–Thu 10am–10pm',
      lat: 25.0761,
      lng: 55.1337,
      areas: ['Dubai Marina','JBR','Jumeirah Beach Residence','Palm Jumeirah','The Greens','The Views','Dubai Internet City','Dubai Media City','Tecom','Barsha Heights','Jumeirah Lake Towers','JLT']
    }
  ],

  'Abu Dhabi': [
    {
      id: 'AUH-01',
      name: 'TAMM Abu Dhabi City Customer Happiness Centre',
      address: 'Abu Dhabi City Centre Mall area, Hamdan Street, Abu Dhabi',
      phone: '800 555',
      hours: 'Mon–Thu 7:30am–3:30pm | Fri 7:30am–12pm',
      lat: 24.4936,
      lng: 54.3742,
      areas: ['Abu Dhabi Island','Corniche','Hamdan Street','Electra Street','Tourist Club Area','Al Zahiyah','Al Markaziyah','Al Mushrif','Al Rawdah','Al Khalidiyah','Karama Abu Dhabi','Al Manhal']
    },
    {
      id: 'AUH-02',
      name: 'TAMM Khalifa City Customer Happiness Centre',
      address: 'Khalifa City A, near Masdar City, Abu Dhabi',
      phone: '800 555',
      hours: 'Mon–Thu 7:30am–3:30pm | Fri 7:30am–12pm',
      lat: 24.4243,
      lng: 54.5274,
      areas: ['Khalifa City','Khalifa City A','Khalifa City B','Masdar City','Mohammed Bin Zayed City','Al Reef','Shahama','Al Bahia','Al Samha','Hydra Village','Between Two Bridges','Mussafah']
    },
    {
      id: 'AUH-03',
      name: 'TAMM Al Ain Customer Happiness Centre',
      address: 'Al Ain City Centre area, Al Ain, Abu Dhabi',
      phone: '800 555',
      hours: 'Mon–Thu 7:30am–3:30pm | Fri 7:30am–12pm',
      lat: 24.2075,
      lng: 55.7447,
      areas: ['Al Ain','Al Jimi','Al Muwaiji','Al Mutawaa','Al Hili','Al Markhaniyah','Zakher','Al Khrair','Mezyad','Remah','Al Yahar']
    }
  ],

  Sharjah: [
    {
      id: 'SHJ-01',
      name: 'Sharjah Police Traffic Department — Al Rahmaniya',
      address: 'Airport Street, near Bridge No. 6, Al Rahmaniya, Sharjah',
      phone: '800 60000',
      hours: 'Mon–Thu 7:30am–3pm | Fri 7:30am–12pm',
      lat: 25.3290,
      lng: 55.4908,
      areas: ['Al Rahmaniya','Al Nahda Sharjah','Muweilah','University City','Al Khan','Al Qasimia','Al Mamzar Sharjah','Industrial Area 1','Industrial Area 2','Industrial Area 3','Al Yarmook','Abu Shagara','Al Mirgab']
    },
    {
      id: 'SHJ-02',
      name: 'Sharjah Police Traffic Department — Rolla',
      address: 'King Faisal Street, Rolla Area, Sharjah City Centre, Sharjah',
      phone: '800 60000',
      hours: 'Mon–Thu 7:30am–3pm | Fri 7:30am–12pm',
      lat: 25.3463,
      lng: 55.3889,
      areas: ['Rolla','Al Ghuwair','Al Majaz','Al Taawun','Al Buhaira','Al Qasba','Al Wahda','Al Falah','Al Tala\'a','Al Soor','Al Heerah','Al Gharb','Al Dhaid Road area']
    },
    {
      id: 'SHJ-03',
      name: 'Sharjah Traffic Department — Khor Fakkan',
      address: 'Khor Fakkan City Centre, Khor Fakkan, Sharjah East Coast',
      phone: '800 60000',
      hours: 'Mon–Thu 7:30am–3pm | Fri 7:30am–12pm',
      lat: 25.3373,
      lng: 56.3460,
      areas: ['Khor Fakkan','Kalba','Dibba Al Hisn','Al Badiyah','Sharm','Mirbah']
    }
  ],

  Ajman: [
    {
      id: 'AJM-01',
      name: 'Ajman Police Traffic & Licensing Department',
      address: 'Sheikh Ammar Bin Humaid Street, Al Hamidiya 1, Ajman',
      phone: '80070',
      hours: 'Mon–Thu 7:30am–2:30pm | Fri 7:30am–11:30am',
      lat: 25.4052,
      lng: 55.5136,
      areas: ['Ajman City Centre','Al Hamidiya','Al Nuaimia','Al Rashidiya Ajman','Al Rumaila','Al Jurf','Al Rawda','Al Mowaihat','Al Tallah','Al Helio','Al Amerah','Masfout','Al Manama Ajman','Al Sawan','Emirates City','Ajman Uptown']
    }
  ],

  'Ras Al Khaimah': [
    {
      id: 'RAK-01',
      name: 'RAK Police Traffic & Licensing Department HQ',
      address: 'Al Mamoura Area, near RAK Hospital, Ras Al Khaimah City',
      phone: '07 203 1111',
      hours: 'Mon–Thu 7:30am–2:30pm | Fri 7:30am–11:30am',
      lat: 25.7953,
      lng: 55.9760,
      areas: ['RAK City Centre','Al Nakheel','Al Hamra','Al Marjan Island','Al Mairid','Dafan','Al Rams','Al Jazeera Al Hamra','Julfar','Al Uraibi','Al Qawasim Corniche','Al Dhait','Khuzam','Al Muntasir']
    },
    {
      id: 'RAK-02',
      name: 'RAK Police Traffic Department — Al Ghubb',
      address: 'Al Ghubb Area, Ras Al Khaimah',
      phone: '07 203 1111',
      hours: 'Mon–Thu 7:30am–2:30pm | Fri 7:30am–11:30am',
      lat: 25.6702,
      lng: 55.9805,
      areas: ['Khatt','Wadi Shah','Ghalilah','Al Ghubb','Seih Al Uraibi','Al Hayl','Digdagga','Masafi RAK side','Falaj Al Mualla RAK side']
    }
  ],

  Fujairah: [
    {
      id: 'FUJ-01',
      name: 'Fujairah Police Traffic & Licensing Centre',
      address: 'Fujairah Police HQ, Hamad Bin Abdullah Road, Fujairah City',
      phone: '09 222 1111',
      hours: 'Mon–Thu 7:30am–2:30pm | Fri 7:30am–11:30am',
      lat: 25.1288,
      lng: 56.3265,
      areas: ['Fujairah City','Al Faseel','Sakamkam','Al Gurfa','Merashid','Qidfa','Al Aqah','Al Bidiyah','Dhadna','Al Lulayyah','Dibba Al Fujairah','Masafi Fujairah side']
    }
  ],

  'Umm Al Quwain': [
    {
      id: 'UAQ-01',
      name: 'UAQ Police Traffic & Licensing Department',
      address: 'UAQ Police HQ, Al Ramlah Area, Umm Al Quwain',
      phone: '06 706 2700',
      hours: 'Mon–Thu 7:30am–2:30pm | Fri 7:30am–11:30am',
      lat: 25.5648,
      lng: 55.5554,
      areas: ['UAQ City','Al Ramlah','Al Salama','Al Raqaib','Al Salam UAQ','Falaj Al Mualla','Umm Al Quwain Free Zone','Ahmed Bin Rashid Port area','Al Dur']
    }
  ]
};

// ── Distance calculation (Haversine) ──────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var straightLine = R * c;
  // For short city distances (<30km): use 1.4 (city roads, turns)
  // For longer inter-emirate distances (>30km): use 1.15 (highways are direct)
  var multiplier = straightLine < 30 ? 1.4 : 1.15;
  return +(straightLine * multiplier).toFixed(1);
}

// Area name coordinates (approximate centres of major areas)
var AREA_COORDS = {
  // Dubai
  'Dubai Marina': { lat: 25.0761, lng: 55.1337 },
  'JBR': { lat: 25.0794, lng: 55.1347 },
  'Jumeirah Beach Residence': { lat: 25.0794, lng: 55.1347 },
  'Palm Jumeirah': { lat: 25.1124, lng: 55.1390 },
  'JLT': { lat: 25.0693, lng: 55.1567 },
  'Jumeirah Lake Towers': { lat: 25.0693, lng: 55.1567 },
  'Al Barsha': { lat: 25.1110, lng: 55.1990 },
  'Al Barsha 1': { lat: 25.1099, lng: 55.1990 },
  'Dubai Hills': { lat: 25.1032, lng: 55.2344 },
  'Arabian Ranches': { lat: 25.0521, lng: 55.2714 },
  'Downtown Dubai': { lat: 25.1972, lng: 55.2744 },
  'DIFC': { lat: 25.2080, lng: 55.2830 },
  'Business Bay': { lat: 25.1862, lng: 55.2700 },
  'Bur Dubai': { lat: 25.2522, lng: 55.2966 },
  'Karama': { lat: 25.2406, lng: 55.3037 },
  'Deira': { lat: 25.2697, lng: 55.3094 },
  'Al Rigga': { lat: 25.2625, lng: 55.3203 },
  'Al Nahda Dubai': { lat: 25.2836, lng: 55.3700 },
  'Al Qusais': { lat: 25.2803, lng: 55.3782 },
  'Mirdif': { lat: 25.2231, lng: 55.4205 },
  'Garhoud': { lat: 25.2394, lng: 55.3530 },
  'Festival City': { lat: 25.2252, lng: 55.3625 },
  'Silicon Oasis': { lat: 25.1203, lng: 55.3781 },
  'Academic City': { lat: 25.0921, lng: 55.4154 },
  'International City': { lat: 25.1652, lng: 55.4148 },
  'Al Warqa': { lat: 25.2008, lng: 55.4196 },
  'Al Mizhar': { lat: 25.2108, lng: 55.4137 },
  'Al Rashidiya': { lat: 25.2340, lng: 55.4000 },
  'Jumeirah': { lat: 25.2048, lng: 55.2708 },
  'Al Safa': { lat: 25.1820, lng: 55.2456 },
  'Al Wasl': { lat: 25.1963, lng: 55.2605 },
  'Tecom': { lat: 25.0947, lng: 55.1744 },
  'Barsha Heights': { lat: 25.0988, lng: 55.1741 },
  'Motor City': { lat: 25.0534, lng: 55.2330 },
  'Sports City': { lat: 25.0479, lng: 55.2239 },
  'Discovery Gardens': { lat: 25.0320, lng: 55.1445 },
  'Jumeirah Golf Estates': { lat: 25.0263, lng: 55.1656 },
  // Sharjah
  'Muweilah': { lat: 25.3224, lng: 55.5046 },
  'University City': { lat: 25.3173, lng: 55.5109 },
  'Al Nahda Sharjah': { lat: 25.3127, lng: 55.4345 },
  'Al Khan': { lat: 25.3497, lng: 55.3888 },
  'Al Majaz': { lat: 25.3350, lng: 55.3820 },
  'Al Taawun': { lat: 25.3006, lng: 55.3811 },
  'Al Qasimia': { lat: 25.3580, lng: 55.4200 },
  'Al Mamzar Sharjah': { lat: 25.2976, lng: 55.3605 },
  'Rolla': { lat: 25.3463, lng: 55.3889 },
  'Industrial Area Sharjah': { lat: 25.3550, lng: 55.4700 },
  'Al Gharb Sharjah': { lat: 25.3690, lng: 55.4400 },
  'Khor Fakkan': { lat: 25.3373, lng: 56.3460 },
  'Kalba': { lat: 25.0714, lng: 56.3572 },
  'Dibba Al Hisn': { lat: 25.6195, lng: 56.2686 },
  // Ajman
  'Ajman City': { lat: 25.4052, lng: 55.5136 },
  'Al Nuaimia': { lat: 25.3990, lng: 55.5200 },
  'Al Rashidiya Ajman': { lat: 25.3870, lng: 55.4750 },
  'Al Jurf': { lat: 25.3750, lng: 55.4600 },
  'Emirates City': { lat: 25.4350, lng: 55.5400 },
  'Al Amerah': { lat: 25.4236, lng: 55.5532 },
  'Ajman Uptown': { lat: 25.4100, lng: 55.5800 },
  // Abu Dhabi
  'Abu Dhabi Island': { lat: 24.4936, lng: 54.3742 },
  'Corniche': { lat: 24.4670, lng: 54.3350 },
  'Khalifa City': { lat: 24.4243, lng: 54.5274 },
  'Khalifa City A': { lat: 24.4243, lng: 54.5274 },
  'Mohammed Bin Zayed City': { lat: 24.3639, lng: 54.5419 },
  'Al Reef': { lat: 24.2983, lng: 54.5694 },
  'Mussafah': { lat: 24.3447, lng: 54.4726 },
  'Masdar City': { lat: 24.4280, lng: 54.6186 },
  'Al Raha Beach': { lat: 24.4178, lng: 54.6268 },
  'Yas Island': { lat: 24.4930, lng: 54.6050 },
  'Saadiyat Island': { lat: 24.5415, lng: 54.4272 },
  'Al Ain': { lat: 24.2075, lng: 55.7447 },
  // RAK
  'RAK City': { lat: 25.7953, lng: 55.9760 },
  'Al Nakheel RAK': { lat: 25.7700, lng: 55.9550 },
  'Al Hamra': { lat: 25.6888, lng: 55.7836 },
  'Al Marjan Island': { lat: 25.6636, lng: 55.7569 },
  'Khatt': { lat: 25.7020, lng: 56.0273 },
  // Fujairah
  'Fujairah City': { lat: 25.1288, lng: 56.3265 },
  'Al Aqah': { lat: 25.4732, lng: 56.3547 },
  'Dibba Al Fujairah': { lat: 25.5997, lng: 56.2596 },
  'Masafi': { lat: 25.2996, lng: 56.1405 },
  // UAQ
  'UAQ City': { lat: 25.5648, lng: 55.5554 },
  'Falaj Al Mualla': { lat: 25.4867, lng: 55.6289 },
  'Al Ramlah': { lat: 25.5648, lng: 55.5554 }
};

// ── Find nearest centre to a given area ──────────────────────────
function findNearestCentre(emirate, area) {
  var centres = GOVT_CENTRES[emirate];
  if (!centres || centres.length === 0) {
    return { centre: { name: emirate + ' Government Service Centre', address: emirate, id: 'DEFAULT' }, distanceKm: 15.0 };
  }
  var areaKey = area ? Object.keys(AREA_COORDS).find(function(k) {
    var kl = k.toLowerCase();
    var al = (area || '').toLowerCase();
    return kl === al || kl.includes(al) || al.includes(kl);
  }) : null;
  if (areaKey) {
    var coords = AREA_COORDS[areaKey];
    // Check if area is in a different emirate by seeing which emirate's
    // centres are closest to the area coords
    // If inter-emirate, pick the most accessible centre (index 0 = main city centre)
    // not necessarily nearest by raw coords (avoids Al Ain being picked for Sharjah area -> AUH)
    var best = centres[0];
    var bestD = Infinity;
    for (var i = 0; i < centres.length; i++) {
      var d = haversineKm(coords.lat, coords.lng, centres[i].lat, centres[i].lng);
      // Skip Al Ain centre for inter-emirate queries (too far east)
      if (centres[i].id === 'AUH-03' && emirate === 'Abu Dhabi') {
        // Only use Al Ain if area explicitly mentions Al Ain
        var areaLower = (area || '').toLowerCase();
        if (!areaLower.includes('al ain') && !areaLower.includes('ain')) continue;
      }
      if (d < bestD) { bestD = d; best = centres[i]; }
    }
    return { centre: best, distanceKm: bestD };
  }
  var avg = { 'Dubai': 12, 'Abu Dhabi': 18, 'Sharjah': 8, 'Ajman': 6, 'Ras Al Khaimah': 9, 'Fujairah': 7, 'Umm Al Quwain': 5 };
  return { centre: centres[0], distanceKm: avg[emirate] || 10 };
}

// ── Carbon calculation from real distance ─────────────────────────
var UAE_METRICS = {
  CO2_PER_KM_GRAMS:   192,
  FUEL_LITERS_PER_KM: 0.08,
  PETROL_PRICE_AED:   2.89
};

function calculateImpact(emirate, area) {
  console.log('[calculateImpact] emirate:', emirate, '| area:', area);
  var result  = findNearestCentre(emirate, area);
  var distKm  = result.distanceKm;

  // Safety check — never return 0
  if (!distKm || distKm <= 0) {
    var defaults = {
      'Dubai': 10.0, 'Abu Dhabi': 15.0, 'Sharjah': 8.0,
      'Ajman': 6.0, 'Ras Al Khaimah': 9.0,
      'Fujairah': 7.0, 'Umm Al Quwain': 5.0
    };
    distKm = defaults[emirate] || 10.0;
  }

  // Round trip
  var roundTripKm    = +(distKm * 2).toFixed(1);
  var co2SavedKg     = +((roundTripKm * UAE_METRICS.CO2_PER_KM_GRAMS) / 1000).toFixed(2);
  var fuelSavedL     = +(roundTripKm * UAE_METRICS.FUEL_LITERS_PER_KM).toFixed(2);
  var moneySavedAed  = +(fuelSavedL * UAE_METRICS.PETROL_PRICE_AED).toFixed(2);

  return {
    centerName:      result.centre.name,
    centerAddress:   result.centre.address,
    centerId:        result.centre.id,
    distanceSavedKm: roundTripKm,
    co2SavedKg:      co2SavedKg,
    fuelSavedLiters: fuelSavedL,
    moneySavedAed:   moneySavedAed,
    methodology:     'UAE MoCCAE 192g CO2/km · Special 95 AED 2.89/L · Driving distance = straight-line x 1.4'
  };
}


// NOL recharge points near Sharjah (for Sharjah residents)
var NOL_NEAR_SHARJAH = {
  name: 'RTA Al Nahda Metro Station (nearest NOL top-up from Sharjah)',
  address: 'Al Nahda Metro Station, Al Nahda Street, Dubai (5 min from Sharjah border)',
  lat: 25.2836, lng: 55.3700
};

module.exports = {
  GOVT_CENTRES:    GOVT_CENTRES,
  AREA_COORDS:     AREA_COORDS,
  findNearestCentre: findNearestCentre,
  calculateImpact: calculateImpact,
  UAE_METRICS:     UAE_METRICS
};