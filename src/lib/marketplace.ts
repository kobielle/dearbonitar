export const ITEM_CATEGORIES = [
  "Food",
  "Electronics",
  "Gadgets",
  "Books",
  "Clothing",
  "Shoes",
  "Furniture",
  "Appliances",
  "Baby items",
  "School supplies",
  "Kitchen items",
  "Medication",
  "Beauty & Personal Care",
  "Other",
] as const;

export const ITEM_FEED_CATEGORIES = ["All", ...ITEM_CATEGORIES] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍚",
  Electronics: "🔌",
  Gadgets: "📱",
  Books: "📚",
  Clothing: "🧥",
  Shoes: "👟",
  Furniture: "🪑",
  Appliances: "🍳",
  "Baby items": "🍼",
  "School supplies": "✏️",
  "Kitchen items": "🍳",
  Medication: "💊",
  "Beauty & Personal Care": "🧴",
  Other: "📦",
};

export const NIGERIA_LOCATION_OPTIONS: Record<string, string[]> = {
  Lagos: [
    "Ajah", "Lekki", "Yaba", "Ikeja", "Surulere", "Maryland", "Ikorodu",
    "Festac", "Obalende", "Egbeda", "Oshodi", "Isolo", "Mushin", "Agege",
    "Alimosho", "Badagry", "Epe", "Ibeju-Lekki", "Apapa", "Victoria Island",
  ],
  Abuja: [
    "Wuse", "Garki", "Maitama", "Kubwa", "Asokoro", "Lugbe", "Gwarinpa",
    "Jabi", "Utako", "Karu", "Nyanya", "Mpape", "Durumi", "Lifecamp",
    "Apo", "Gudu", "Bwari", "Gwagwalada", "Kuje", "Abaji",
  ],
  Oyo: [
    "Ibadan", "Ogbomosho", "Oyo Town", "Saki", "Iseyin", "Eruwa",
    "Igboho", "Kishi", "Okeho", "Igbo-Ora", "Lalupon", "Fiditi",
  ],
  Rivers: [
    "Port Harcourt", "Obio-Akpor", "Eleme", "Bonny", "Degema",
    "Ahoada", "Oyigbo", "Okrika", "Omoku", "Ogu-Bolo", "Etche", "Ikwerre",
  ],
  Kano: [
    "Nassarawa", "Fagge", "Dala", "Gwale", "Kano Municipal", "Tarauni",
    "Ungogo", "Kumbotso", "Gezawa", "Dawakin Tofa", "Wudil", "Bichi",
  ],
  Ogun: [
    "Abeokuta", "Ijebu-Ode", "Sagamu", "Ota", "Ilaro", "Ifo",
    "Owode", "Ijebu-Igbo", "Ogere", "Agbara", "Sango-Ota", "Mowe",
  ],
  Enugu: [
    "Enugu", "Nsukka", "Agbani", "Udi", "Oji River", "Awgu",
    "Ezeagu", "Igbo-Eze", "Nkanu", "Aninri", "Uzo-Uwani", "Igbo-Etiti",
  ],
  Delta: [
    "Warri", "Asaba", "Sapele", "Ughelli", "Agbor", "Ozoro",
    "Oleh", "Kwale", "Abraka", "Effurun", "Burutu", "Bomadi",
  ],
  Kaduna: [
    "Kaduna", "Zaria", "Kafanchan", "Kagoro", "Saminaka", "Birnin Gwari",
    "Kachia", "Giwa", "Ikara", "Kudan", "Makarfi", "Sabon Gari",
  ],
  Anambra: [
    "Awka", "Onitsha", "Nnewi", "Ekwulobia", "Ogidi", "Ihiala",
    "Aguata", "Ozubulu", "Nkpor", "Obosi", "Atani", "Otuocha",
  ],
  Imo: [
    "Owerri", "Orlu", "Okigwe", "Oguta", "Mbaise", "Nkwerre",
    "Ideato", "Njaba", "Obowo", "Ehime Mbano", "Isu", "Onuimo",
  ],
  Abia: [
    "Umuahia", "Aba", "Ohafia", "Arochukwu", "Bende", "Isuikwuato",
    "Isiala Ngwa", "Ukwa", "Osisioma", "Obingwa", "Ugwunagbo", "Umu Nneochi",
  ],
  Edo: [
    "Benin City", "Auchi", "Ekpoma", "Uromi", "Igarra", "Ubiaja",
    "Igueben", "Sabongida-Ora", "Fugar", "Afuze", "Irrua", "Egor",
  ],
  Osun: [
    "Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo", "Ejigbo",
    "Ikire", "Modakeke", "Ila Orangun", "Ilobu", "Inisa", "Ikirun",
  ],
  Ondo: [
    "Akure", "Owo", "Ondo Town", "Ore", "Ikare", "Okitipupa",
    "Igbokoda", "Idanre", "Ilaje", "Irele", "Odigbo", "Ifedore",
  ],
  Kwara: [
    "Ilorin", "Offa", "Jebba", "Lafiagi", "Omu-Aran", "Patigi",
    "Share", "Erin-Ile", "Ajasse-Ipo", "Igbaja", "Oke-Oyi", "Oro",
  ],
  Ekiti: [
    "Ado-Ekiti", "Ikere", "Ijero", "Efon-Alaaye", "Ikole", "Oye",
    "Iyin-Ekiti", "Aramoko", "Igede", "Omuo", "Emure", "Ise",
  ],
  Benue: [
    "Makurdi", "Otukpo", "Gboko", "Katsina-Ala", "Vandeikya", "Obi",
    "Oju", "Ogbadibo", "Okpokwu", "Kwande", "Logo", "Tarka",
  ],
  Plateau: [
    "Jos", "Bukuru", "Pankshin", "Shendam", "Barkin Ladi", "Mangu",
    "Langtang", "Wase", "Bokkos", "Riyom", "Bassa", "Kanke",
  ],
  "Cross River": [
    "Calabar", "Ikom", "Ogoja", "Obudu", "Ugep", "Akamkpa",
    "Odukpani", "Obubra", "Biase", "Bekwarra", "Boki", "Etung",
  ],
  Akwa Ibom: [
    "Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak", "Etinan",
    "Itu", "Nsit Ibom", "Mkpat Enin", "Essien Udim", "Ibiono Ibom", "Uruan",
  ],
  Bayelsa: [
    "Yenagoa", "Brass", "Ogbia", "Sagbama", "Kolokuma", "Nembe",
    "Ekeremor", "Southern Ijaw", "Amassoma", "Oporoma", "Kaiama", "Swali",
  ],
  Ebonyi: [
    "Abakaliki", "Afikpo", "Onueke", "Ezza", "Ikwo", "Ishielu",
    "Ohaozara", "Ivo", "Ohaukwu", "Onicha", "Izzi", "Ebonyi Town",
  ],
  Kogi: [
    "Lokoja", "Okene", "Idah", "Kabba", "Anyigba", "Ajaokuta",
    "Dekina", "Ogori", "Ankpa", "Omala", "Ofu", "Igalamela",
  ],
  Nassarawa: [
    "Lafia", "Keffi", "Nasarawa Town", "Akwanga", "Doma", "Wamba",
    "Awe", "Keana", "Obi", "Toto", "Kokona", "Nasarawa Eggon",
  ],
  Niger: [
    "Minna", "Bida", "Kontagora", "Suleja", "New Bussa", "Lapai",
    "Mokwa", "Agaie", "Wushishi", "Shiroro", "Bosso", "Chanchaga",
  ],
  Taraba: [
    "Jalingo", "Wukari", "Bali", "Takum", "Ibi", "Zing",
    "Gashaka", "Sardauna", "Karim Lamido", "Lau", "Ardo Kola", "Kurmi",
  ],
  Adamawa: [
    "Yola", "Mubi", "Numan", "Jimeta", "Ganye", "Gombi",
    "Michika", "Madagali", "Song", "Fufore", "Girei", "Mayo-Belwa",
  ],
  Bauchi: [
    "Bauchi", "Azare", "Misau", "Jama'are", "Katagum", "Dass",
    "Tafawa Balewa", "Bogoro", "Toro", "Alkaleri", "Ningi", "Kirfi",
  ],
  Borno: [
    "Maiduguri", "Biu", "Damboa", "Dikwa", "Gwoza", "Konduga",
    "Monguno", "Bama", "Jere", "Chibok", "Askira", "Mafa",
  ],
  Gombe: [
    "Gombe", "Kumo", "Billiri", "Kaltungo", "Bajoga", "Dukku",
    "Nafada", "Funakaye", "Akko", "Balanga", "Shomgom", "Yamaltu",
  ],
  Jigawa: [
    "Dutse", "Hadejia", "Gumel", "Kazaure", "Ringim", "Birnin Kudu",
    "Babura", "Garki", "Kiyawa", "Jahun", "Miga", "Gwaram",
  ],
  Katsina: [
    "Katsina", "Daura", "Funtua", "Malumfashi", "Dutsin-Ma", "Kankia",
    "Jibia", "Batsari", "Mashi", "Dan Musa", "Mani", "Musawa",
  ],
  Kebbi: [
    "Birnin Kebbi", "Argungu", "Yauri", "Zuru", "Jega", "Bagudo",
    "Gwandu", "Kalgo", "Koko", "Bunza", "Aleiro", "Augie",
  ],
  Sokoto: [
    "Sokoto", "Tambuwal", "Bodinga", "Illela", "Gwadabawa", "Goronyo",
    "Wamako", "Kware", "Dange Shuni", "Silame", "Yabo", "Tureta",
  ],
  Yobe: [
    "Damaturu", "Potiskum", "Gashua", "Nguru", "Geidam", "Bade",
    "Jakusko", "Fika", "Nangere", "Machina", "Bursari", "Yunusari",
  ],
  Zamfara: [
    "Gusau", "Kaura Namoda", "Talata Mafara", "Anka", "Maru", "Bungudu",
    "Tsafe", "Zurmi", "Shinkafi", "Bakura", "Birnin Magaji", "Maradun",
  ],
};
