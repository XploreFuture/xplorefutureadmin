
// cities.ts
const citiesData: { [state: string]: string[] } = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Navi Mumbai", "Aurangabad", "Kolhapur", "Ahmednagar", "Thane", "Amravati", "Satara", "Solapur", "Sangli", "Jalgaon", "Wardha", "Beed", "Dhule", "Latur", "Chandrapur", "Ratnagiri", "Akola", "Nanded", "Raigad", "Yavatmal", "Palghar", "Osmanabad", "Parbhani", "Buldhana", "Gondiya", "Washim", "Karjat", "Sindhudurg", "Shirpur", "Nandurbar", "Karad", "Kalyan", "Bhandara", "Jalna", "Panvel", "Hingoli", "Udgir", "Ambegaon", "Baramati", "Gadchiroli", "Ambajogai", "Malkapur", "Badnapur", "Bandra", "Barshi", "Kopargaon", "Sakoli", "Buldana", "Khamgaon", "Shegaon", "Goregaon", "Naigaon", "Malegaon", "Indapur", "Miraj", "Pandharpur", "Shahapur", "Vasai", "Vikramgad", "Wada", "Dapoli", "Lonere", "Murtijapur", "Khuldabad", "Ashti", "Majalgoan", "Wadwani", "Chikhli", "Bramhapuri", "Kalamnuri", "Amalner", "Chopda", "Karvir", "Shirol", "Ahmadpur", "Nilanga", "Kamptee", "Kalwan", "Peth", "Tuljapur", "Umarga", "Manwath", "Haveli", "Junnar", "Alibag", "Chiplun", "Khed", "Kadegaon", "Khandala", "Wai", "Sawantwadi", "Akkalkot", "Bhiwandi", "Karanja", "Babhulgaon", "Umarkhed", "Wani"
],
  Karnataka: ["Bangalore", "Mangalore", "Mysore", "Belgaum", "Dharwad", "Gulbarga", "Tumkur", "Hubli", "Hassan", "Udupi", "Mandya", "Raichur", "Shimoga", "Bijapur", "Bidar", "Davanagere", "Bagalkot", "Kolar", "Gadag", "Bellary", "Manipal", "Chitradurga", "Belagavi", "Chamarajnagar", "Puttur", "Haveri", "Dakshin Kannada", "Kodagu", "Moodbidri", "Bhatkal", "Chikmagalur", "Ramanagar", "Karwar", "Chikkaballapur", "Koppal", "Sullia", "Virajpet", "Surathkal", "Basavakalyan", "Bantwal", "Bhadravathi", "Kundapura", "Kumta", "Kannada", "Tiptur", "Yelahanka", "Bangalore Rural", "Hoskote", "Gundlupet", "Koppa", "Belthangady", "Davangere", "Holenarasipur", "Ranibennur", "Hunsur", "Honavar", "Sirsi", "Hospet", "Hampi", "Dodballapura", "Nelamagala", "Nelamangala", "Chikodi", "Kudligi", "Bhalki", "Chintamani", "Hiriyur", "Harihar", "Kalaghatgi", "Gangavathi", "Chincholi", "Alur", "Arkalgud", "Arsikere", "Belur", "Channrayapatna", "Sakleshpura", "Madikeri", "Chickballapur", "Krishnarajpet", "Maddur", "Nagamangala", "Pandavapura", "Sindhanur", "Shikarpur", "Thirthahalli", "Sira", "Karkal", "Ankola", "Haliyal", "Shorapur"
],
    Delhi: ["New Delhi",  "Sonepat", "Faridabad", "Rohtak", "Alwar", "Karnal", "Panipat", "Jind", "Palwal",    "Mewat", "Neemrana", "Sohna"],
  
    "Tamil Nadu": ["Chennai", "Coimbatore", "Tiruchirappalli", "Namakkal", "Madurai", "Salem", "Kanyakumari", "Tirunelveli", "Vellore", "Kanchipuram", "Dindigul", "Thanjavur", "Erode", "Tiruvannamalai", "Villupuram", "Thiruvallur", "Pudukkottai", "Perambalur", "Karur", "Dharmapuri", "Tiruppur", "Cuddalore", "Nagercoil", "Sivaganga", "Thoothukudi", "Krishnagiri", "Nagapattinam", "Virudhunagar", "Karaikudi", "Ramanathapuram", "Theni", "Kumbakonam", "Ariyalur", "Pollachi", "Sivakasi", "Chengalpattu", "Thiruvarur", "Hosur", "Kallakurichi", "Ooty", "Perundurai", "Tiruchengodu", "Thoothukkudi", "Tuticorin", "Rajapalayam", "Krishnankovil", "Tenkasi", "Sriperumbudur", "Dharapuram", "Palayamkottai", "Tirutani", "Annamalai", "Viluppuram", "Attoor", "Maduranthakam", "Tambaram", "Rasipuram", "Pattukkottai", "Periyakulam", "Thuraiyur", "Kovilpatti", "Aruppukottai", "Palani", "Gobichettipalayam", "Sathyamangalam", "Cheyyur", "Aundipatti", "Manapparai", "Avadi", "Poonamallee", "Vandavasi", "Tiruchendur", "Arcot", "Tindivanam", "Kodaikanal", "The Nilgiris", "Siruseri", "Mettupalayam", "Udumalaipettai", "Chidambaram", "Bhavani", "Dharapram", "Kangayam", "Saidapet", "Kulithalai", "Thirumangalam", "Mayiladuthurai", "Vedaranyam", "Coonoor", "Udagamandalam", "Devakottai", "Paramakudi", "Tiruppattur", "Bodinayakanur", "Ponneri", "Arni", "Mannargudi", "Katpadi", "Tirupattur", "Vaniyambadi", "Vallam", "Jayamkondacholapuram", "Udayarpalayam", "Maduravoyal", "Mambalam", "Madhavapuram", "Kattumannarkoil", "Virudhachalam", "Pappiredipatti", "Palladam", "Uthiramerur", "Agastheeswaram", "Thovalai", "Barugur", "Pochampalli", "Melur", "Usilampatti", "Arantangi", "Illuppur", "Kulathur", "Manamelkudi", "Tirumayam", "Attur", "Idappadi", "Mettur", "Yercaud", "Ilayangudi", "Manamadurai", "Papanasam", "Thiruvidaimarudur", "Srirangam", "Thottiyam", "Ulundurpet", "Ambasamudram", "Radhapuram", "Sankarankoil", "Shenkottai", "Virakeralampudur", "Pallipattu", "Tiruvarur", "Ettayapuram", "Gudiyatham", "Tirupathur", "Walajapet", "Chinnasalem", "Kariapatti", "Sattur", "Srivilliputhur", "Thirunanravur"],
  
    "Uttar Pradesh": ["Noida", "Lucknow", "Greater Noida", "Ghaziabad", "Meerut", "Kanpur", "Allahabad", "Varanasi", "Agra", "Bareilly", "Mathura", "Gorakhpur", "Aligarh", "Moradabad", "Jhansi", "Bijnor", "Saharanpur", "Barabanki", "Jaunpur", "Ayodhya", "Muzaffarnagar", "Azamgarh", "Rae Bareli", "Hapur", "Sitapur", "Bagpat", "Bulandshahr", "Ghazipur", "Gonda", "Sultanpur", "Ballia", "Etawah", "Firozabad", "Mirzapur", "Shahjahanpur", "Unnao", "Kanpur Dehat", "Farrukhabad", "Ambedkar Nagar", "Modinagar", "Amethi", "Auraiya", "Banda", "Etah", "Mau", "Bhaghpat", "Basti", "Hardoi", "Jyotiba Phule Nagar", "Bahraich", "Deoria", "Fatehpur", "Kannauj", "Kaushambi", "Sonbhadra", "Badaun", "Gautam Budh Nagar", "Rampur", "Mainpuri", "Pilibhit", "Sant Kabir Nagar", "Amroha", "Chandauli", "Hathras", "Pratapgarh", "Lakhimpur", "Chitrakoot", "Siddharthnagar", "Shikohabad", "Murad Nagar", "Gazipur", "Chandausi", "Gyanpur", "Lalitpur", "Maharajganj", "Sant Ravidas Nagar", "Kashanj", "Shravasti", "Chunar", "Shamli", "Bhadohi", "Powayan", "Kheri", "Orai", "Mahamaya Nagar", "Jalaun", "Meja", "Sahson", "Sikandra", "Najibabad", "Saifai", "Sohawal", "Achheja", "Sambhal", "Palhepur", "Ramaipur", "Ghatampur", "Manjhanpur", "Padrauna", "Hamirpur", "Jansath", "Shahabad", "Gangoh", "Nakur"
    ],
    "Andhra Pradesh":[
    "Visakhapatnam", "Guntur", "East Godavari", "West Godavari", "Tirupati",
    "Vijayawada", "Nellore", "Kurnool", "Kadapa", "Anantapur", "Vizianagaram",
    "Krishna", "Prakasam", "Srikakulam", "Bhimavaram", "Chittoor", "Kakinada",
    "Rajahmundhry", "Eluru", "Tadepalligudem", "Madanapalle", "Nandyal",
    "Machilipatnam", "Narasaraopet", "Kuppam", "Venkatachalam", "Ongole",
    "Tanuku", "Puttur", "Proddatur", "Chirala", "Sri City", "Peddapuram",
    "Puttaparthy", "Nuzvid", "Hindupur", "Ramachandrapuram", "Amaravathi",
    "Rajampet", "Gudlavalleru", "Seetharamapuram", "Narasapuram", "Ananthapur",
    "Rapthadu", "Kalikiri", "Murakambattu", "Palamaner", "Thondamanadu",
    "Anaparthy", "Gangavaram", "Rajanagaram", "Bapatla", "Mangalagiri", "Tenali",
    "Simhadripuram", "Agiripalle", "Guduru", "Nandigama", "Vissannapet",
    "Vuyyur", "Adoni", "Srisailam", "Podili", "Etcherla", "Rajam", "Anakapalle",
    "Garividi", "Kovvur", "Nallajerla", "Nidadavole", "Palakoderu", "Palakol"
],
    "Arunachal Pradesh": [
    "Itanagar", "Pasighat", "Papum Pare", "West Siang", "Lohit", "East Siang",
    "Namsai", "Ziro", "Lower Subansiri", "West Kameng", "Roing", "Naharlagun",
    "Basar"
],
    "Assam": [
    "Guwahati", "Nagaon", "Jorhat", "Dibrugarh", "Barpeta", "Sibsagar",
    "Dhemaji", "Golaghat", "Lakhimpur", "Sonitpur", "Nalbari", "Silchar",
    "Tezpur", "Karimganj", "Kokrajhar", "Tinsukia", "Kamrup", "Bongaigaon",
    "Goalpara", "Marigaon", "Baksa", "Darrang", "Sivasagar", "Dhubri",
    "Dispur", "Hailakandi", "Karbi Anglong", "Cachar", "Pathsala", "Sorbhog",
    "Majuli", "Diphu", "Hatinamati", "Tihu", "Napaam"
],
    "Bihar": [
    "Patna", "Gaya", "Muzaffarpur", "Nalanda", "Darbhanga", "Bhagalpur",
    "Purnea", "Aurangabad", "Siwan", "Vaishali", "Samastipur", "Bhojpur",
    "Motihari", "Madhepura", "Madhubani", "Katihar", "Saharsa", "Chapra",
    "Begusarai", "Buxar", "Kishanganj", "Nawada", "Hajipur", "Bettiah",
    "Araria", "Banka", "Gopalganj", "Munger", "Rohtas", "Sasaram", "Jehanabad",
    "Sitamarhi", "Arrah", "Arwal", "Jamui", "Bhabua", "Bihta", "Lakhisarai",
    "Supaul", "Chakia", "Turkaulia", "Khagaria", "Barhiya", "Biharsharif",
    "Chandi", "Harnaut", "Paliganj", "Dehri", "Pusa", "Shekhopur", "Sheohar"
],
    "Chhattisgarh": [
    "Raipur", "Bhilai", "Durg", "Bilaspur", "Rajnandgaon", "Korba", "Raigarh",
    "Bastar", "Surguja", "Janjgir", "Balod", "Ambikapur", "Jashpur", "Kanker",
    "Mahasamund", "Khairagarh", "Jagdalpur", "Bemetara", "Baloda", "Jaijaipur",
    "Manendragarh"
],
    "Goa":[
    "Panji", "North Goa", "South Goa", "Salcete", "Ponda", "Bardez",
    "Bicholim", "Pernem", "Tiswadi", "Cancona", "Curchorem", "Quepem"
],
    "Gujarat": [
    "Vadodara", "Rajkot", "Anand", "Mehsana", "Junagadh", "Bhavnagar",
    "Vallabh Vidyanagar", "Kachchh", "Jamnagar", "Sabarkantha", "Bharuch",
    "Navsari", "Patan", "Bardoli", "Visnagar", "Sidhpur", "Nadiad", "Kalol",
    "Himmatnagar", "Kheda", "Valsad", "Porbandar", "Banaskantha", "Amreli",
    "Godhra", "Kadi", "Vapi", "Silvassa", "Palanpur", "Surendra Nagar",
    "Panchmahal", "Bhuj", "Wadhwan", "Dahod", "Modasa", "Ankleshwar", "Morvi",
    "Rajpipala", "Narmada", "Savarkundla", "Bhabhar", "Dantiwada", "Botad",
    "Mandvi", "Mahemdabad", "Matar", "Vadnagar", "Dang", "Lunawada", "Dhoraji",
    "Jetpur", "Bayad", "Talod"
],
    "Haryana": [
    "Jhajjar", "Karnal", "Panipat", "Kurukshetra", "Bhiwani", "Sirsa", "Jind",
    "Palwal", "Rewari", "Kaithal", "Panchkula", "Bahadurgarh", "Fatehabad",
    "Mahendragarh", "Mewat", "Jagadhri", "Pehowa", "Ballabgarh", "Narnaul",
    "Charkhi Dadri", "Sohna", "Nilokheri", "Agroha", "Yamuna Nagar", "Loharu",
    "Narwana", "Dahina", "Mehem"
],
    "Himachal Pradesh": [
    "Solan",
    "Mandi",
    "Shimla",
    "Sirmaur",
    "Kangra",
    "Hamirpur",
    "Una",
    "Palampur",
    "Bilaspur",
    "Chandigarh",
    "Chamba",
    "Baddi",
    "Sundarnagar",
    "Paonta",
    "Kullu",
    "Rampur",
    "Rohru"
],
    "Jharkhand":[
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Hazaribagh",
    "Bokaro",
    "Palamu",
    "Garhwa",
    "Deoghar",
    "Kodarma",
    "Giridih",
    "Ramgarh",
    "Seraikela",
    "Dumka",
    "Chaibasa",
    "Lohardaga",
    "Khunti",
    "Chatra",
    "Baharagora",
    "Latehar",
    "Bhandra",
    "Pakur",
    "Gola",
    "Sahibganj"
],
    "Kerala": [
    "Thiruvananthapuram", "Thrissur", "Ernakulam", "Kochi", "Kottayam",
    "Malappuram", "Palakkad", "Kannur", "Kollam", "Kozhikode", "Calicut",
    "Pathanamthitta", "Alappuzha", "Kasaragod", "Idukki", "Wayanad",
    "Cherthala", "Muvattupuzha", "Aluva", "Thodupuzha", "Perinthalmanna",
    "Kothamangalam", "Thiruvalla", "Chengannur", "Tiruvalla",
    "Changanacherry", "Adoor", "Taliparamba", "Manjeri", "Ottapalam",
    "Mavelikara", "Kottarakara", "Kanjirappally", "Koyilandi", "Vadakara",
    "Tirur", "Pathanapuram", "Neyyattinkara", "Peermade", "Thalasery",
    "Nilambur", "Chittur", "Trivendrum", "Kodungallur", "Sulthan Batheri",
    "Cochin", "Paravur", "Karunagapally", "Vaikom", "Ponani", "Tirurangadi",
    "Alatur", "Mannarkad", "Ottpalam", "Mallappally", "Ranny", "Nedumangad",
    "Manantahvady"
],
    "Madhya Pradesh": [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar",
    "Chhatarpur", "Rewa", "Ratlam", "Satna", "Mandsaur", "Morena", "Katni",
    "Khandwa", "Khargone", "Balaghat", "Barwani", "Bhind", "Burhanpur",
    "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Guna", "Shivpuri",
    "Vidisha", "Sehore", "Shahdol", "Anuppur", "Betul", "Hoshangabad",
    "Jhabua", "Mandla", "Raisen", "Tikamgarh", "Singrauli", "Dindori",
    "Narsinghpur", "Neemuch", "Panna", "Rajgarh", "Sidhi", "Umaria",
    "Manawar", "Mhow", "Sanwer", "Saikheda", "Nalkheda", "Mahidpur", "Barwaha"
],
    "Manipur": [
    "Imphal",
    "Churachandpur",
    "Thoubal",
    "Chandel"
],

    "Meghalaya":[
    "Shillong", "Ri-Bhoi", "West Garo Hills", "Jaintia Hills", "Jowai",
    "West Khasi Hills", "Mawlai", "Mendipathar", "Tura"
],
    "Mizoram": [
    "Aizawl", "Champhai", "Lunglei", "Saiha", "Serchhip"
],
    "Nagaland": [
    "Dimapur",
    "Kohima"
],
    "Odisha": [
    "Bhubaneswar", "Cuttack", "Berhampur", "Rourkela", "Sambalpur", "Khorda",
    "Balasore", "Puri", "Bargarh", "Rayagada", "Mayurbhanj", "Koraput",
    "Ganjam", "Baleswar", "Baripada", "Dhenkanal", "Jajapur", "Angul",
    "Bhadrak", "Jagatsinghpur", "Gunupur", "Sundergarh", "Kendrapara",
    "Bolangir", "Balangir", "Keonjhar", "Burla", "Bhawanipatna", "Jharsuguda",
    "Kendujhar", "Phulbani", "Jeypore", "Gajapati", "Khaira", "Remuna",
    "Paralkhemundi", "Aska", "Jagatsinghapur", "Jatni", "Karanjia", "Khunta",
    "Nabarangapur", "Odagaon", "Kuchinda", "Bonaigarh"
],
    "Punjab": [
    "Chandigarh", "Mohali", "Ludhiana", "Jalandhar", "Patiala", "Amritsar",
    "Bathinda", "Hoshiarpur", "Sangrur", "Moga", "Gurdaspur",
    "Fatehgarh Sahib", "Gobindgarh", "Faridkot", "Kapurthala", "Ropar",
    "Nawanshahr", "Firozpur", "Muktsar", "Barnala", "Mansa", "Batala",
    "Pathankot", "Abohar", "Tarn Taran", "Phagwara", "Malout", "Rupnagar",
    "Khanna", "Rajpura", "Fazilka", "Nakodar", "Samana",
    "Shahid Bhagat Singh Nagar", "Bhikhiwind", "Bareta", "Talwandi Sabo",
    "Jaitu", "Kotkapura", "Bassi", "Dasuya", "Nabha", "Bela", "S.A.S. Nagar",
    "Dhuri", "Lehragaga", "Kang", "Patti", "Doraha"
],

    "Rajasthan": [
    "Jaipur", "Udaipur", "Jodhpur", "Ajmer", "Alwar", "Sikar", "Kota",
    "Bikaner", "Jhunjhunu", "Bhilwara", "Bharatpur", "Ganganagar",
    "Chittorgarh", "Pilani", "Hanumangarh", "Sirohi", "Banswara", "Jhalawar",
    "Dausa", "Nagaur", "Rajsamand", "Sriganganagar", "Dholpur", "Karauli",
    "Bundi", "Churu", "Pali", "Tonk", "Barmer", "Dungarpur", "Sawai Madhopur",
    "Beawar", "Neemrana", "Baran", "Jaisalmer", "Jalore", "Sardarshahr",
    "Pratapgarh", "Sanganer"
],
    "Sikkim": [
    "Gangtok",
    "East Sikkim",
    "South Sikkim",
    "West Sikkim"
],
    "Telangana":[
    "Hyderabad", "Warangal", "Secunderabad", "Karimnagar", "Khammam",
    "Nalgonda", "Mahabubnagar", "Nizamabad", "Ghatkesar", "Medak", "Suryapet",
    "Rangareddy", "Moinabad", "Sangareddy", "Kothagudem", "Adilabad",
    "Himayathnagar", "Mancherial", "Siddipet", "Kamareddy", "Nirmal",
    "Malkagiri Manda", "Hayathnagar", "Maheswaram", "Vikarabad", "Koratla",
    "Raikal", "Palwancha", "Narsapur", "Bibinagar", "Choutuppal", "Chiryal",
    "Hanamkonda", "Jangaon"
],
    "Tripura": [
    "Agartala",
    "West Tripura",
    "Dhalai",
    "North Tripura",
    "Udaipur",
    "Kumarghat",
    "Amarpur",
    "Sonamura"
],

    "Uttarakhand": [
    "Dehradun", "Roorkee", "Haridwar", "Nainital", "Udham Singh Nagar",
    "Almora", "Garhwal", "Haldwani", "Chamoli", "Pithoragarh", "Rishikesh",
    "Uttarkashi", "Kashipur", "Rudrapur", "Tehri", "Champawat", "Pantnagar",
    "Kotdwara", "Pauri", "Bageshwar", "Rudraprayag", "Srinagar Garhwal",
    "Lohaghat", "Tanakpur", "Laksar", "Bhimtal", "Srinagar", "Pratapnagar",
    "Gadarpur", "Khatima", "Kichha", "Kshipur", "Sitarganj"
],
    "West Bengal": [
    "Kolkata", "Hooghly", "Durgapur", "Bardhaman", "Medinipur", "Nadia",
    "Murshidabad", "Birbhum", "Howrah", "North 24 Parganas", "Midnapore",
    "Bankura", "South 24 Parganas", "Cooch Behar", "Malda", "Darjeeling",
    "Siliguri", "Jalpaiguri", "Purulia", "Asansol", "Dakshin Dinajpur",
    "Haldia", "Kalyani", "Jhargram", "Uttar Dinajpur", "Alipurduar",
    "Bundwan", "Kharagpur", "Barasat", "Behrampore", "Krishnagar", "Raiganj",
    "Serampore", "Tamluk", "Berhampore", "Baruipur", "Chandrakona", "Belur",
    "Haringhat", "Santiniketan", "Bishnupur", "Raipur", "Chandannagar",
    "Kalna", "Purbasthali", "Bolpur Sriniketan", "Dubrajpur", "Nalhati",
    "Rampurhat", "Sainthia", "Kalimpong", "Kurseong", "Panskura",
    "Purba Madhabpur", "Arambagh", "Bandel", "Khamargachi", "Rajganj",
    "Kankurgachi", "Baishnabnagar", "Kadamtala", "Ratua", "Burwan",
    "Raghunathganj", "Chakdaha", "Santipur", "Bira", "Gaighata", "Mohanpur",
    "New Town", "Purandarpur", "Saltklake", "Saltlake", "Srikrishnapur",
    "Manbazar", "Neturia", "Canning", "Diamond Harbour", "Falta", "Namkhana",
    "Sonarpur", "Balurghat", "Gangarampur", "Belda", "Ghatal", "Paragana"
]
    
};
export default citiesData;