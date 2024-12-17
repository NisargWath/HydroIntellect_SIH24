const sidebar = document.querySelector("#sidebar");
const hide_sidebar = document.querySelector(".hide-sidebar");
const new_chat_button = document.querySelector(".new-chat");

hide_sidebar.addEventListener( "click", function() {
    sidebar.classList.toggle( "hidden" );
} );

const user_menu = document.querySelector(".user-menu ul");
const show_user_menu = document.querySelector(".user-menu button");

show_user_menu.addEventListener( "click", function() {
    if( user_menu.classList.contains("show") ) {
        user_menu.classList.toggle( "show" );
        setTimeout( function() {
            user_menu.classList.toggle( "show-animate" );
        }, 200 );
    } else {
        user_menu.classList.toggle( "show-animate" );
        setTimeout( function() {
            user_menu.classList.toggle( "show" );
        }, 50 );
    }
} );

const models = document.querySelectorAll(".model-selector button");

for( const model of models ) {
    model.addEventListener("click", function() {
        document.querySelector(".model-selector button.selected")?.classList.remove("selected");
        model.classList.add("selected");
    });
}

const message_box = document.querySelector("#message");

message_box.addEventListener("keyup", function() {
    message_box.style.height = "auto";
    let height = message_box.scrollHeight + 2;
    if( height > 200 ) {
        height = 200;
    }
    message_box.style.height = height + "px";
});

function show_view( view_selector ) {
    document.querySelectorAll(".view").forEach(view => {
        view.style.display = "none";
    });

    document.querySelector(view_selector).style.display = "flex";
}

new_chat_button.addEventListener("click", function() {
    show_view( ".new-chat-view" );
});

document.querySelectorAll(".conversation-button").forEach(button => {
    button.addEventListener("click", function() {
        show_view( ".conversation-view" );
    })
});



// forcast

let map;

// State-District and District-Reservoir mappings
const stateDistricts = {
    "Maharashtra": ["Ahmednagar","Akola","Amravati", "Aurangabad", "Beed","Bhandara","Buldhana","Chandrapur","Gadchiroli","Gondia","Hingoli", "Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane", "Wardha","Washim","Yavatmal"],
   "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagara", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Vijayapura", "Yadgir"],
   "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke-Kessang", "Papum Pare", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
   "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup Rural", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dhemaji", "Sibsagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri"],
   "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali"],
   "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela Pendra Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham (formerly Kawardha)", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
   "Goa": ["North Goa", "South Goa"],
   "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
   "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Panchkula", "Panipat", "Palwal", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
   "Himachal Pradesh": ["Chamba", "Kangra", "Lahaul and Spiti", "Kullu", "Mandi", "Shimla", "Solan", "Sirmaur", "Bilaspur", "Una"],
   "Jharkhand": ["Bokaro", "Chatra", "Deogarh", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
   "Kerala": ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"],
   "Madhya Pradesh": ["Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara", "Damoh", "Datia", "Dewas","Dhar","Dindori","Guna","Gwalior", "Harda","Hoshangabad","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch", "Panna","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
   "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Thoubal", "Ukhrul"],
   "Meghalaya": ["East Khasi Hills", "West Khasi Hills", "East Garo Hills", "West Garo Hills", "Ri Bhoi", "South Garo Hills", "North Garo Hills", "Jaintia Hills", "West Jaintia Hills"],
   "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Lawngtlai", "Mamit", "Saiha", "Hnahthial", "Khawzawl", "Saitual"],
   "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto", "Longleng", "Kiphire", "Tseminyu", "Niuland", "Chümoukedima"],
   "Odisha": [ "Angul","Balangir","Balasore", "Bargarh", "Bhadrak","Boudh","Cuttack","Debagarh", "Dhenkanal","Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur","Jharsuguda","Kalahandi", "Kandhamal", "Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur",  "Sundargarh"],
   "Punjab": ["Amritsar","Barnala", "Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Firozpur","Gurdaspur","Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana","Mansa","Moga", "Pathankot","Patiala","Rupnagar","Sangrur","SAS Nagar (Mohali)", "Shaheed Bhagat Singh Nagar (Nawanshahr)","Sri Muktsar Sahib","Tarn Taran"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "  Sikkim": ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"],
    "Tamil Nadu": ["Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri", "Dindigul","Erode","Kallakurichi",  "Kancheepuram","Karur","Krishnagiri","Madurai",  "Mayiladuthurai","Nagapattinam","Namakkal","Nilgiris","Perambalur", "Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni", "Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
    "  Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon",  "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",  "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar",  "Mancherial", "Medak", "Medchal–Malkajgiri", "Mulugu", "Nagarkurnool",  "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
    "  Tripura": ["Dhalai","Khowai","North Tripura","Sepahijala","Unakoti","West Tripura","Gomati","South Tripura"],
    "  Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli",  "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad",  "Gautam Buddha Nagar", "Ghaziabad", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Mau", "Meerut", "Mirzapur",  "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Rae Bareli", "Rampur", "Saharanpur",  "Sant Kabir Nagar", "Shahjahanpur", "Shrawasti", "Siddharthnagar", "Sonbhadra", "Sultanpur",  "Unnao", "Varanasi"],
    "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    " West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Medinipur", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
    " Andaman and Nicobar Islands": ["South Andaman", "North and Middle Andaman", "Nicobar"],
    "Chandigarh": ["Chandigarh"],
    "  Dadra and Nagar Haveli and Daman and Diu": ["Dadra", "Nagar Haveli", "Daman", "Diu"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South West Delhi", "West Delhi"],
    "  Jammu and Kashmir": [ "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian",   "Srinagar", "Udhampur"],
    "  Ladakh": ["Leh", "Kargil"],
    "  Lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Andrott", "Kalapeni", "Kiltan", "Suheli Par", "Viringili"],
    "  Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

const districtLatLng = {
    // #maharastra
    "Ahmednagar": { lat: 19.0948, lng: 74.7384 },
  "Akola": { lat: 20.7037, lng: 77.0027 },
  "Amravati": { lat: 20.9333, lng: 77.7500 },
  "Aurangabad": { lat: 19.8762, lng: 75.3433 },
  "Beed": { lat: 18.9891, lng: 75.7609 },
  "Bhandara": { lat: 21.1667, lng: 79.6500 },
  "Buldhana": { lat: 20.5293, lng: 76.1834 },
  "Chandrapur": { lat: 19.9500, lng: 79.3000 },
  "Gadchiroli": { lat: 20.1000, lng: 80.0000 },
  "Gondia": { lat: 21.4500, lng: 80.2000 },
  "Hingoli": { lat: 19.7148, lng: 77.1428 },
  "Jalgaon": { lat: 21.0077, lng: 75.5626 },
  "Jalna": { lat: 19.8410, lng: 75.8800 },
  "Kolhapur": { lat: 16.7050, lng: 74.2433 },
  "Latur": { lat: 18.4088, lng: 76.5604 },
  "Mumbai City": { lat: 18.9388, lng: 72.8354 },
  "Mumbai Suburban": { lat: 19.0825, lng: 72.7411 },
  "Nagpur": { lat: 21.1458, lng: 79.0882 },
  "Nanded": { lat: 19.1536, lng: 77.2979 },
  "Nandurbar": { lat: 21.3667, lng: 74.2333 },
  "Nashik": { lat: 20.0110, lng: 73.7903 },
  "Osmanabad": { lat: 18.1869, lng: 76.0412 },
  "Palghar": { lat: 19.6969, lng: 72.7650 },
  "Parbhani": { lat: 19.2608, lng: 76.7748 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Raigad": { lat: 18.5565, lng: 73.2891 },
  "Ratnagiri": { lat: 16.9944, lng: 73.3000 },
  "Sangli": { lat: 16.8667, lng: 74.5667 },
  "Satara": { lat: 17.6805, lng: 73.9952 },
  "Sindhudurg": { lat: 16.1667, lng: 73.7000 },
  "Solapur": { lat: 17.6599, lng: 75.9064 },
  "Thane": { lat: 19.2183, lng: 72.9781 },
  "Wardha": { lat: 20.7453, lng: 78.6022 },
  "Washim": { lat: 20.1116, lng: 77.1332 },
  "Yavatmal": { lat: 20.3896, lng: 78.1307 },

    // Karnataka
    "Bagalkot": { lat: 16.1766, lng: 75.6625 },
    "Ballari": { lat: 15.1394, lng: 76.9214 },
    "Belagavi": { lat: 15.8497, lng: 74.4977 },
    "Bengaluru Rural": { lat: 13.2194, lng: 77.3871 },
    "Bengaluru Urban": { lat: 12.9716, lng: 77.5946 },
    "Bidar": { lat: 17.9133, lng: 77.5301 },
    "Chamarajanagara": { lat: 11.9236, lng: 76.9405 },
    "Chikkaballapura": { lat: 13.4350, lng: 77.7278 },
    "Chikkamagaluru": { lat: 13.3187, lng: 75.7745 },
    "Chitradurga": { lat: 14.2226, lng: 76.4002 },
    "Dakshina Kannada": { lat: 12.9141, lng: 74.8560 },
    "Davangere": { lat: 14.4646, lng: 75.9238 },
    "Dharwad": { lat: 15.4589, lng: 75.0078 },
    "Gadag": { lat: 15.4294, lng: 75.6297 },
    "Hassan": { lat: 13.0072, lng: 76.0960 },
    "Haveri": { lat: 14.7934, lng: 75.4044 },
    "Kalaburagi": { lat: 17.3297, lng: 76.8343 },
    "Kodagu": { lat: 12.3375, lng: 75.8069 },
    "Kolar": { lat: 13.1360, lng: 78.1291 },
    "Koppal": { lat: 15.3460, lng: 76.1546 },
    "Mandya": { lat: 12.5246, lng: 76.8952 },
    "Mysuru": { lat: 12.2958, lng: 76.6394 },
    "Raichur": { lat: 16.2011, lng: 77.3566 },
    "Ramanagara": { lat: 12.7114, lng: 77.2800 },
    "Shivamogga": { lat: 13.9299, lng: 75.5681 },
    "Tumakuru": { lat: 13.3376, lng: 77.1140 },
    "Udupi": { lat: 13.3409, lng: 74.7421 },
    "Vijayapura": { lat: 16.8310, lng: 75.7100 },
    "Yadgir": { lat: 16.7700, lng: 77.1376 },

    // #gujrat
    "Ahmedabad": { "lat": 23.0225, "lng": 72.5714 },
  "Amreli": { "lat": 21.6032, "lng": 71.2221 },
  "Anand": { "lat": 22.5645, "lng": 72.9289 },
  "Aravalli": { "lat": 23.2543, "lng": 73.0743 },
  "Banaskantha": { "lat": 24.1713, "lng": 72.1421 },
  "Bharuch": { "lat": 21.7051, "lng": 72.9959 },
  "Bhavnagar": { "lat": 21.7645, "lng": 72.1519 },
  "Botad": { "lat": 22.1704, "lng": 71.6685 },
  "Chhota Udaipur": { "lat": 22.3134, "lng": 74.0135 },
  "Dahod": { "lat": 22.8337, "lng": 74.2594 },
  "Dang": { "lat": 20.7500, "lng": 73.7000 },
  "Devbhoomi Dwarka": { "lat": 22.2396, "lng": 68.9678 },
  "Gandhinagar": { "lat": 23.2156, "lng": 72.6369 },
  "Gir Somnath": { "lat": 20.8775, "lng": 70.9012 },
  "Jamnagar": { "lat": 22.4707, "lng": 70.0577 },
  "Junagadh": { "lat": 21.5222, "lng": 70.4579 },
  "Kachchh": { "lat": 23.7337, "lng": 69.8597 },
  "Kheda": { "lat": 22.7500, "lng": 72.6830 },
  "Mahisagar": { "lat": 23.1667, "lng": 73.6000 },
  "Mehsana": { "lat": 23.6000, "lng": 72.4000 },
  "Morbi": { "lat": 22.8173, "lng": 70.8373 },
  "Narmada": { "lat": 21.8700, "lng": 73.5030 },
  "Navsari": { "lat": 20.9467, "lng": 72.9520 },
  "Panchmahal": { "lat": 22.7500, "lng": 73.6000 },
  "Patan": { "lat": 23.8500, "lng": 72.1250 },
  "Porbandar": { "lat": 21.6417, "lng": 69.6293 },
  "Rajkot": { "lat": 22.3039, "lng": 70.8022 },
  "Sabarkantha": { "lat": 23.8500, "lng": 73.0000 },
  "Surat": { "lat": 21.1702, "lng": 72.8311 },
  "Surendranagar": { "lat": 22.7277, "lng": 71.6486 },
  "Tapi": { "lat": 21.2200, "lng": 73.4500 },
  "Vadodara": { "lat": 22.3072, "lng": 73.1812 },
  "Valsad": { "lat": 20.6100, "lng": 72.9250 },

//   #arunachal Pradesh
    "Anjaw": { "lat": 28.0667, "lng": 96.8333 },
   "Changlang": { "lat": 27.1286, "lng": 95.7417 },
   "Dibang Valley": { "lat": 28.9667, "lng": 95.8667 },
   "East Kameng": { "lat": 27.4167, "lng": 93.0333 },
   "East Siang": { "lat": 28.0667, "lng": 95.3333 },
   "Kamle": { "lat": 27.3333, "lng": 93.8000 },
   "Kra Daadi": { "lat": 27.6167, "lng": 93.3833 },
   "Kurung Kumey": { "lat": 27.6333, "lng": 93.6167 },
   "Lower Dibang Valley": { "lat": 28.2000, "lng": 95.6167 },
   "Lower Siang": { "lat": 27.8333, "lng": 94.8333 },
   "Lower Subansiri": { "lat": 27.5500, "lng": 93.8833 },
   "Namsai": { "lat": 27.7833, "lng": 96.0667 },
   "Pakke-Kessang": { "lat": 27.0667, "lng": 93.0500 },
   "Papum Pare": { "lat": 27.1167, "lng": 93.6000 },
   "Siang": { "lat": 28.3833, "lng": 94.9000 },
   "Tawang": { "lat": 27.5861, "lng": 91.8687 },
   "Tirap": { "lat": 27.0167, "lng": 95.6000 },
   "Upper Siang": { "lat": 28.6333, "lng": 95.3333 },
   "Upper Subansiri": { "lat": 27.7833, "lng": 94.4167 },
   "West Kameng": { "lat": 27.3333, "lng": 92.4000 },
   "West Siang": { "lat": 28.5833, "lng": 94.7167 },

//    Assam
"Baksa": { "lat": 26.6667, "lng": 91.3333 },
"Barpeta": { "lat": 26.3167, "lng": 91.0000 },
"Biswanath": { "lat": 26.8167, "lng": 93.6333 },
"Bongaigaon": { "lat": 26.4600, "lng": 90.6500 },
"Cachar": { "lat": 24.8333, "lng": 92.8333 },
"Charaideo": { "lat": 26.9667, "lng": 94.7667 },
"Chirang": { "lat": 26.5000, "lng": 90.6167 },
"Darrang": { "lat": 26.5000, "lng": 92.0333 },
"Dhemaji": { "lat": 27.5000, "lng": 94.5833 },
"Dhubri": { "lat": 26.0167, "lng": 89.9833 },
"Dibrugarh": { "lat": 27.4833, "lng": 94.9000 },
"Goalpara": { "lat": 26.1667, "lng": 90.6167 },
"Golaghat": { "lat": 26.5170, "lng": 93.9500 },
"Hailakandi": { "lat": 24.6833, "lng": 92.5667 },
"Hojai": { "lat": 26.0000, "lng": 92.8667 },
"Jorhat": { "lat": 26.7500, "lng": 94.2167 },
"Kamrup Metropolitan": { "lat": 26.1833, "lng": 91.7333 },
"Kamrup Rural": { "lat": 26.2667, "lng": 91.5667 },
"Karbi Anglong": { "lat": 26.0000, "lng": 93.5000 },
"Karimganj": { "lat": 24.8667, "lng": 92.3500 },
"Kokrajhar": { "lat": 26.4000, "lng": 90.2667 },
"Lakhimpur": { "lat": 27.2167, "lng": 94.1167 },
"Majuli": { "lat": 27.0000, "lng": 94.5000 },
"Morigaon": { "lat": 26.3333, "lng": 92.3333 },
"Nagaon": { "lat": 26.3500, "lng": 92.6833 },
"Nalbari": { "lat": 26.4500, "lng": 91.4667 },
"Sibsagar": { "lat": 26.9841, "lng": 94.6378 },
"Sonitpur": { "lat": 26.8667, "lng": 92.8000 },
"South Salmara-Mankachar": { "lat": 25.9333, "lng": 89.8667 },
"Tinsukia": { "lat": 27.5000, "lng": 95.3667 },
"Udalguri": { "lat": 26.7500, "lng": 92.1000 },

// #bihar
    "Araria": { "lat": 26.1542, "lng": 87.5120 },
    "Arwal": { "lat": 25.1911, "lng": 84.6897 },
    "Aurangabad": { "lat": 24.7515, "lng": 84.3740 },
    "Banka": { "lat": 24.8850, "lng": 86.9226 },
    "Begusarai": { "lat": 25.4186, "lng": 86.1336 },
    "Bhagalpur": { "lat": 25.2500, "lng": 87.0000 },
    "Bhojpur": { "lat": 25.3877, "lng": 84.3740 },
    "Buxar": { "lat": 25.5647, "lng": 83.9785 },
    "Darbhanga": { "lat": 26.1542, "lng": 85.8918 },
    "East Champaran": { "lat": 26.6358, "lng": 84.8568 },
    "Gaya": { "lat": 24.7914, "lng": 85.0002 },
    "Gopalganj": { "lat": 26.4698, "lng": 84.4401 },
    "Jamui": { "lat": 24.9250, "lng": 86.2257 },
    "Jehanabad": { "lat": 25.2130, "lng": 84.9918 },
    "Kaimur": { "lat": 25.0500, "lng": 83.6160 },
    "Katihar": { "lat": 25.5384, "lng": 87.5737 },
    "Khagaria": { "lat": 25.5021, "lng": 86.4720 },
    "Kishanganj": { "lat": 26.1023, "lng": 87.9545 },
    "Lakhisarai": { "lat": 25.1620, "lng": 86.0947 },
    "Madhepura": { "lat": 25.9210, "lng": 86.7927 },
    "Madhubani": { "lat": 26.3660, "lng": 86.0715 },
    "Munger": { "lat": 25.3746, "lng": 86.4735 },
    "Muzaffarpur": { "lat": 26.1209, "lng": 85.3647 },
    "Nalanda": { "lat": 25.1222, "lng": 85.3647 },
    "Nawada": { "lat": 24.8865, "lng": 85.5435 },
    "Patna": { "lat": 25.5941, "lng": 85.1376 },
    "Purnia": { "lat": 25.7771, "lng": 87.4753 },
    "Rohtas": { "lat": 24.9602, "lng": 83.8349 },
    "Saharsa": { "lat": 25.8835, "lng": 86.5956 },
    "Samastipur": { "lat": 25.8608, "lng": 85.7897 },
    "Saran": { "lat": 25.8673, "lng": 84.8239 },
    "Sheikhpura": { "lat": 25.1433, "lng": 85.8625 },
    "Sheohar": { "lat": 26.5157, "lng": 85.2937 },
    "Sitamarhi": { "lat": 26.5934, "lng": 85.4900 },
    "Siwan": { "lat": 26.2218, "lng": 84.3589 },
    "Supaul": { "lat": 26.1158, "lng": 86.5962 },
    "Vaishali": { "lat": 25.9870, "lng": 85.1252 },
  
    // #chattisgarh
    "Balod": { "lat": 21.4983, "lng": 81.2921 },
  "Baloda Bazar": { "lat": 21.9191, "lng": 82.0831 },
  "Balrampur": { "lat": 22.6747, "lng": 81.8892 },
  "Bastar": { "lat": 19.3439, "lng": 81.7666 },
  "Bemetara": { "lat": 21.4535, "lng": 81.4893 },
  "Bijapur": { "lat": 18.8216, "lng": 80.7765 },
  "Bilaspur": { "lat": 22.0785, "lng": 82.1505 },
  "Dantewada": { "lat": 19.0854, "lng": 81.2873 },
  "Dhamtari": { "lat": 20.7074, "lng": 81.5294 },
  "Durg": { "lat": 21.1880, "lng": 81.2830 },
  "Gariaband": { "lat": 20.6487, "lng": 81.8215 },
  "Gaurela Pendra Marwahi": { "lat": 22.1253, "lng": 82.3047 },
  "Janjgir-Champa": { "lat": 22.0730, "lng": 82.7525 },
  "Jashpur": { "lat": 23.0067, "lng": 83.2274 },
  "Kabirdham (formerly Kawardha)": { "lat": 22.0715, "lng": 81.4585 },
  "Kanker": { "lat": 20.4061, "lng": 81.4390 },
  "Kondagaon": { "lat": 20.3831, "lng": 81.5389 },
  "Korba": { "lat": 22.3509, "lng": 82.6904 },
  "Koriya": { "lat": 23.3587, "lng": 82.6269 },
  "Mahasamund": { "lat": 21.0305, "lng": 82.0104 },
  "Mungeli": { "lat": 22.0992, "lng": 81.6033 },
  "Narayanpur": { "lat": 19.4093, "lng": 81.6015 },
  "Raigarh": { "lat": 21.9034, "lng": 83.4041 },
  "Raipur": { "lat": 21.2514, "lng": 81.6296 },
  "Rajnandgaon": { "lat": 21.0881, "lng": 81.0334 },
  "Sukma": { "lat": 18.6454, "lng": 81.5534 },
  "Surajpur": { "lat": 23.2895, "lng": 82.7522 },
  "Surguja": { "lat": 23.1043, "lng": 83.2296 },

//   #goa
"North Goa": { "lat": 15.5367, "lng": 73.8673 },
  "South Goa": { "lat": 15.2901, "lng": 74.0937 },

//   Haryana
"Ambala": { "lat": 30.3781, "lng": 76.7805 },
"Bhiwani": { "lat": 28.7840, "lng": 75.5555 },
"Charkhi Dadri": { "lat": 28.5794, "lng": 75.6412 },
"Faridabad": { "lat": 28.4089, "lng": 77.3169 },
"Fatehabad": { "lat": 29.5071, "lng": 75.4581 },
"Gurugram": { "lat": 28.4595, "lng": 77.0266 },
"Hisar": { "lat": 29.1498, "lng": 75.7222 },
"Jhajjar": { "lat": 28.5915, "lng": 76.6407 },
"Jind": { "lat": 29.3182, "lng": 76.3097 },
"Kaithal": { "lat": 29.8289, "lng": 76.3943 },
"Karnal": { "lat": 29.6904, "lng": 76.9857 },
"Kurukshetra": { "lat": 29.9467, "lng": 76.8514 },
"Mahendragarh": { "lat": 28.0900, "lng": 76.1100 },
"Panchkula": { "lat": 30.6901, "lng": 76.8500 },
"Panipat": { "lat": 29.3919, "lng": 76.9684 },
"Palwal": { "lat": 28.1492, "lng": 77.3177 },
"Rewari": { "lat": 28.1890, "lng": 76.6149 },
"Rohtak": { "lat": 28.8956, "lng": 76.6114 },
"Sirsa": { "lat": 29.5316, "lng": 75.0328 },
"Sonipat": { "lat": 28.9916, "lng": 77.0109 },
"Yamunanagar": { "lat": 30.1311, "lng": 77.2807 },

// Himachal pradesh
"Chamba": { "lat": 32.5537, "lng": 76.1307 },
  "Kangra": { "lat": 32.0806, "lng": 76.1314 },
  "Lahaul and Spiti": { "lat": 32.3157, "lng": 77.5323 },
  "Kullu": { "lat": 32.0055, "lng": 77.1538 },
  "Mandi": { "lat": 32.0120, "lng": 76.9213 },
  "Shimla": { "lat": 31.1048, "lng": 77.1734 },
  "Solan": { "lat": 30.9081, "lng": 77.1197 },
  "Sirmaur": { "lat": 30.4800, "lng": 77.3314 },
  "Bilaspur": { "lat": 31.3814, "lng": 76.7780 },
  "Una": { "lat": 31.4876, "lng": 76.9351 },

//   Jharkhand
"Bokaro": { lat: 23.6856, lng: 85.9903 },
"Chatra": { lat: 24.0333, lng: 84.8333 },
"Deogarh": { lat: 24.4862, lng: 86.6975 },
"Dhanbad": { lat: 23.8000, lng: 86.4500 },
"Dumka": { lat: 24.2527, lng: 87.2423 },
"East Singhbhum": { lat: 22.7987, lng: 86.1455 },
"Garhwa": { lat: 24.1927, lng: 83.2716 },
"Godda": { lat: 24.8292, lng: 87.2876 },
"Gumla": { lat: 23.0658, lng: 84.5764 },
"Hazaribagh": { lat: 23.9942, lng: 85.3582 },
"Jamtara": { lat: 23.9798, lng: 86.7849 },
"Khunti": { lat: 23.0222, lng: 85.3799 },
"Latehar": { lat: 23.6350, lng: 84.4357 },
"Lohardaga": { lat: 23.5181, lng: 84.5356 },
"Pakur": { lat: 24.5956, lng: 87.9672 },
"Palamu": { lat: 24.7016, lng: 84.3597 },
"Ramgarh": { lat: 23.5652, lng: 85.4777 },
"Ranchi": { lat: 23.3441, lng: 85.3096 },
"Sahibganj": { lat: 25.3298, lng: 87.6365 },
"Seraikela Kharsawan": { lat: 22.7532, lng: 86.0925 },
"Simdega": { lat: 22.5319, lng: 84.6937 },
"West Singhbhum": { lat: 22.2771, lng: 85.8004 },

// kerala
"Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
"Kollam": { lat: 8.8932, lng: 76.6141 },
"Pathanamthitta": { lat: 9.2646, lng: 76.7870 },
"Alappuzha": { lat: 9.4981, lng: 76.3388 },
"Kottayam": { lat: 9.5916, lng: 76.5222 },
"Idukki": { lat: 9.9187, lng: 77.1025 },
"Ernakulam": { lat: 9.9816, lng: 76.2999 },
"Thrissur": { lat: 10.5276, lng: 76.2144 },
"Palakkad": { lat: 10.7867, lng: 76.6548 },
"Malappuram": { lat: 11.0736, lng: 76.0742 },
"Kozhikode": { lat: 11.2588, lng: 75.7804 },
"Wayanad": { lat: 11.6854, lng: 76.1320 },
"Kannur": { lat: 11.8745, lng: 75.3704 },
"Kasaragod": { lat: 12.4996, lng: 74.9860 },

// madhya pradesh
"Anuppur": { lat: 23.1032, lng: 81.6910 },
"Ashoknagar": { lat: 24.5747, lng: 77.7304 },
"Balaghat": { lat: 21.8167, lng: 80.1849 },
"Barwani": { lat: 22.0321, lng: 74.8986 },
"Betul": { lat: 21.9020, lng: 77.9028 },
"Bhind": { lat: 26.5668, lng: 78.7956 },
"Bhopal": { lat: 23.2599, lng: 77.4126 },
"Burhanpur": { lat: 21.3193, lng: 76.2228 },
"Chhatarpur": { lat: 24.9177, lng: 79.5889 },
"Chhindwara": { lat: 22.0574, lng: 78.9382 },
"Damoh": { lat: 23.8332, lng: 79.4416 },
"Datia": { lat: 25.6725, lng: 78.4628 },
"Dewas": { lat: 22.9676, lng: 76.0534 },
"Dhar": { lat: 22.6013, lng: 75.3023 },
"Dindori": { lat: 22.9435, lng: 81.0769 },
"Guna": { lat: 24.6476, lng: 77.3115 },
"Gwalior": { lat: 26.2183, lng: 78.1828 },
"Harda": { lat: 22.3442, lng: 77.0956 },
"Hoshangabad": { lat: 22.7536, lng: 77.7256 },
"Indore": { lat: 22.7196, lng: 75.8577 },
"Jabalpur": { lat: 23.1815, lng: 79.9864 },
"Jhabua": { lat: 22.7500, lng: 74.5909 },
"Katni": { lat: 23.8332, lng: 80.3891 },
"Khandwa": { lat: 21.8250, lng: 76.3520 },
"Khargone": { lat: 21.8257, lng: 75.6107 },
"Mandla": { lat: 22.5990, lng: 80.3714 },
"Mandsaur": { lat: 24.0717, lng: 75.0672 },
"Morena": { lat: 26.5023, lng: 77.9921 },
"Narsinghpur": { lat: 22.9506, lng: 79.1841 },
"Neemuch": { lat: 24.4729, lng: 74.8790 },
"Panna": { lat: 24.7277, lng: 80.1875 },
"Rewa": { lat: 24.5340, lng: 81.2960 },
"Sagar": { lat: 23.8388, lng: 78.7378 },
"Satna": { lat: 24.6005, lng: 80.8322 },
"Sehore": { lat: 23.2020, lng: 77.0860 },
"Seoni": { lat: 22.0856, lng: 79.5503 },
"Shahdol": { lat: 23.3077, lng: 81.3568 },
"Shajapur": { lat: 23.4266, lng: 76.2770 },
"Sheopur": { lat: 25.6669, lng: 76.6960 },
"Shivpuri": { lat: 25.4239, lng: 77.6600 },
"Sidhi": { lat: 24.4181, lng: 81.8792 },
"Singrauli": { lat: 24.1991, lng: 82.6753 },
"Tikamgarh": { lat: 24.7456, lng: 78.8314 },
"Ujjain": { lat: 23.1793, lng: 75.7849 },
"Umaria": { lat: 23.5247, lng: 80.8372 },
"Vidisha": { lat: 23.5245, lng: 77.8090 },

// Manipur
"Bishnupur": { lat: 24.6242, lng: 93.7764 },
"Chandel": { lat: 24.3517, lng: 94.0961 },
"Churachandpur": { lat: 24.3335, lng: 93.6827 },
"Imphal East": { lat: 24.8074, lng: 93.9489 },
"Imphal West": { lat: 24.8170, lng: 93.9368 },
"Jiribam": { lat: 24.7914, lng: 93.1267 },
"Kakching": { lat: 24.4857, lng: 93.9782 },
"Kamjong": { lat: 24.9394, lng: 94.4673 },
"Kangpokpi": { lat: 25.1992, lng: 93.9766 },
"Noney": { lat: 24.9513, lng: 93.4543 },
"Pherzawl": { lat: 24.2357, lng: 93.2412 },
"Senapati": { lat: 25.2701, lng: 94.0051 },
"Tamenglong": { lat: 25.0161, lng: 93.4987 },
"Thoubal": { lat: 24.6292, lng: 94.0096 },
"Ukhrul": { lat: 25.1276, lng: 94.3615 },

// maghalaya
"East Khasi Hills": { lat: 25.5788, lng: 91.8933 },
  "West Khasi Hills": { lat: 25.5174, lng: 91.2019 },
  "East Garo Hills": { lat: 25.5715, lng: 90.5984 },
  "West Garo Hills": { lat: 25.5104, lng: 90.2302 },
  "Ri Bhoi": { lat: 25.8538, lng: 91.8750 },
  "South Garo Hills": { lat: 25.4103, lng: 90.6212 },
  "North Garo Hills": { lat: 25.9872, lng: 90.4646 },
  "Jaintia Hills": { lat: 25.6071, lng: 92.1436 },
  "West Jaintia Hills": { lat: 25.4513, lng: 92.2074 },

// mizoram
"Aizawl": { lat: 23.7271, lng: 92.7176 },
    "Lunglei": { lat: 22.8813, lng: 92.7274 },
    "Champhai": { lat: 23.4565, lng: 93.3287 },
    "Serchhip": { lat: 23.2983, lng: 92.8577 },
    "Kolasib": { lat: 24.2234, lng: 92.6760 },
    "Lawngtlai": { lat: 22.5198, lng: 92.9071 },
    "Mamit": { lat: 23.9323, lng: 92.4911 },
    "Saiha": { lat: 22.4922, lng: 92.9732 },
    "Hnahthial": { lat: 23.0874, lng: 92.9004 },
    "Khawzawl": { lat: 23.2232, lng: 93.3197 },
    "Saitual": { lat: 23.4755, lng: 92.9583 },

// Nagaland
"Aizawl": { lat: 23.7271, lng: 92.7176 },
    "Lunglei": { lat: 22.8813, lng: 92.7274 },
    "Champhai": { lat: 23.4565, lng: 93.3287 },
    "Serchhip": { lat: 23.2983, lng: 92.8577 },
    "Kolasib": { lat: 24.2234, lng: 92.6760 },
    "Lawngtlai": { lat: 22.5198, lng: 92.9071 },
    "Mamit": { lat: 23.9323, lng: 92.4911 },
    "Saiha": { lat: 22.4922, lng: 92.9732 },
    "Hnahthial": { lat: 23.0874, lng: 92.9004 },
    "Khawzawl": { lat: 23.2232, lng: 93.3197 },
    "Saitual": { lat: 23.4755, lng: 92.9583 },

// odisha
"Angul": { lat: 20.8390, lng: 85.1042 },
    "Balangir": { lat: 20.7042, lng: 83.4923 },
    "Balasore": { lat: 21.4934, lng: 86.9337 },
    "Bargarh": { lat: 21.3331, lng: 83.6228 },
    "Bhadrak": { lat: 21.0587, lng: 86.4958 },
    "Boudh": { lat: 20.8344, lng: 84.3201 },
    "Cuttack": { lat: 20.4625, lng: 85.8828 },
    "Debagarh": { lat: 21.5371, lng: 84.7332 },
    "Dhenkanal": { lat: 20.6540, lng: 85.5993 },
    "Gajapati": { lat: 19.2694, lng: 84.1288 },
    "Ganjam": { lat: 19.3756, lng: 84.6783 },
    "Jagatsinghpur": { lat: 20.2648, lng: 86.1718 },
    "Jajpur": { lat: 20.8485, lng: 86.3377 },
    "Jharsuguda": { lat: 21.8552, lng: 84.0067 },
    "Kalahandi": { lat: 19.9134, lng: 83.1649 },
    "Kandhamal": { lat: 20.1390, lng: 84.0572 },
    "Kendrapara": { lat: 20.5014, lng: 86.4220 },
    "Kendujhar": { lat: 21.6282, lng: 85.5817 },
    "Khordha": { lat: 20.1820, lng: 85.6208 },
    "Koraput": { lat: 18.8134, lng: 82.7100 },
    "Malkangiri": { lat: 18.3563, lng: 81.8933 },
    "Mayurbhanj": { lat: 22.1340, lng: 86.3190 },
    "Nabarangpur": { lat: 19.2295, lng: 82.5478 },
    "Nayagarh": { lat: 20.1288, lng: 85.1037 },
    "Nuapada": { lat: 20.7849, lng: 82.6460 },
    "Puri": { lat: 19.8135, lng: 85.8312 },
    "Rayagada": { lat: 19.1726, lng: 83.3906 },
    "Sambalpur": { lat: 21.4507, lng: 83.9701 },
    "Subarnapur": { lat: 20.8501, lng: 83.8942 },
    "Sundargarh": { lat: 22.1209, lng: 84.0432 },

// Punjab
"Amritsar": { lat: 31.6340, lng: 74.8723 },
  "Barnala": { lat: 30.3723, lng: 75.5450 },
  "Bathinda": { lat: 30.2110, lng: 74.9455 },
  "Faridkot": { lat: 30.6788, lng: 74.7551 },
  "Fatehgarh Sahib": { lat: 30.6472, lng: 76.4415 },
  "Fazilka": { lat: 30.4023, lng: 74.0284 },
  "Firozpur": { lat: 30.9252, lng: 74.6131 },
  "Gurdaspur": { lat: 32.0419, lng: 75.4080 },
  "Hoshiarpur": { lat: 31.5326, lng: 75.9092 },
  "Jalandhar": { lat: 31.3260, lng: 75.5762 },
  "Kapurthala": { lat: 31.3801, lng: 75.3829 },
  "Ludhiana": { lat: 30.9009, lng: 75.8573 },
  "Mansa": { lat: 29.9983, lng: 75.3924 },
  "Moga": { lat: 30.8130, lng: 75.1717 },
  "Pathankot": { lat: 32.2643, lng: 75.6421 },
  "Patiala": { lat: 30.3398, lng: 76.3869 },
  "Rupnagar": { lat: 30.9680, lng: 76.5265 },
  "Sangrur": { lat: 30.2458, lng: 75.8421 },
  "SAS Nagar (Mohali)": { lat: 30.7046, lng: 76.7179 },
  "Shaheed Bhagat Singh Nagar (Nawanshahr)": { lat: 31.1261, lng: 76.1185 },
  "Sri Muktsar Sahib": { lat: 30.4773, lng: 74.5145 },
  "Tarn Taran": { lat: 31.4511, lng: 74.9275 },

// tamil Nand
"Ariyalur": { lat: 11.1399, lng: 79.0780 },
    "Chengalpattu": { lat: 12.6930, lng: 79.9760 },
    "Chennai": { lat: 13.0827, lng: 80.2707 },
    "Coimbatore": { lat: 11.0168, lng: 76.9558 },
    "Cuddalore": { lat: 11.7480, lng: 79.7714 },
    "Dharmapuri": { lat: 12.1357, lng: 78.2130 },
    "Dindigul": { lat: 10.3681, lng: 77.9803 },
    "Erode": { lat: 11.3410, lng: 77.7172 },
    "Kallakurichi": { lat: 11.7384, lng: 78.9641 },
    "Kancheepuram": { lat: 12.8342, lng: 79.7036 },
    "Karur": { lat: 10.9601, lng: 78.0766 },
    "Krishnagiri": { lat: 12.5186, lng: 78.2137 },
    "Madurai": { lat: 9.9252, lng: 78.1198 },
    "Mayiladuthurai": { lat: 11.1034, lng: 79.6554 },
    "Nagapattinam": { lat: 10.7634, lng: 79.8424 },
    "Namakkal": { lat: 11.2333, lng: 78.1667 },
    "Nilgiris": { lat: 11.4916, lng: 76.7337 },
    "Perambalur": { lat: 11.2333, lng: 78.8830 },
    "Pudukkottai": { lat: 10.3792, lng: 78.8208 },
    "Ramanathapuram": { lat: 9.3719, lng: 78.8300 },
    "Ranipet": { lat: 12.9345, lng: 79.3333 },
    "Salem": { lat: 11.6643, lng: 78.1460 },
    "Sivaganga": { lat: 9.8478, lng: 78.4800 },
    "Tenkasi": { lat: 8.9633, lng: 77.3073 },
    "Thanjavur": { lat: 10.7867, lng: 79.1378 },
    "Theni": { lat: 10.0104, lng: 77.4777 },
    "Thoothukudi": { lat: 8.7642, lng: 78.1348 },
    "Tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
    "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
    "Tirupathur": { lat: 12.4944, lng: 78.5656 },
    "Tiruppur": { lat: 11.1085, lng: 77.3411 },
    "Tiruvallur": { lat: 13.1431, lng: 79.9083 },
    "Tiruvannamalai": { lat: 12.2266, lng: 79.0747 },
    "Tiruvarur": { lat: 10.7725, lng: 79.6368 },
    "Vellore": { lat: 12.9165, lng: 79.1325 },
    "Viluppuram": { lat: 11.9398, lng: 79.4970 },
    "Virudhunagar": { lat: 9.5851, lng: 77.9576 },

// uttarakand
 "Almora": { lat: 29.5970, lng: 79.6591 },
    "Bageshwar": { lat: 29.8384, lng: 79.7714 },
    "Chamoli": { lat: 30.4042, lng: 79.4008 },
    "Champawat": { lat: 29.3364, lng: 80.0962 },
    "Dehradun": { lat: 30.3165, lng: 78.0322 },
    "Haridwar": { lat: 29.9457, lng: 78.1642 },
    "Nainital": { lat: 29.3803, lng: 79.4636 },
    "Pauri Garhwal": { lat: 30.1534, lng: 78.7835 },
    "Pithoragarh": { lat: 29.5854, lng: 80.2097 },
    "Rudraprayag": { lat: 30.2848, lng: 78.9810 },
    "Tehri Garhwal": { lat: 30.3911, lng: 78.4803 },
    "Udham Singh Nagar": { lat: 28.8834, lng: 79.4029 },
    "Uttarkashi": { lat: 30.7298, lng: 78.4438 },

// Chandigarh
"Chandigarh": { lat: 30.7333, lng: 76.7794 },

// delhi
"Central Delhi": { lat: 28.6562, lng: 77.2284 },
"East Delhi": { lat: 28.6604, lng: 77.2708 },
"New Delhi": { lat: 28.6139, lng: 77.2090 },
"North Delhi": { lat: 28.7041, lng: 77.1025 },
"North East Delhi": { lat: 28.7184, lng: 77.2580 },
"North West Delhi": { lat: 28.7956, lng: 77.0652 },
"Shahdara": { lat: 28.6713, lng: 77.2837 },
"South Delhi": { lat: 28.4817, lng: 77.1873 },
"South West Delhi": { lat: 28.6100, lng: 76.9833 },
"West Delhi": { lat: 28.6454, lng: 77.0890 },

// Rajasthan
"Ajmer": { lat: 26.4499, lng: 74.6399 },
"Alwar": { lat: 27.5525, lng: 76.6250 },
"Banswara": { lat: 23.5460, lng: 74.4345 },
"Baran": { lat: 25.1011, lng: 76.5132 },
"Barmer": { lat: 25.7519, lng: 71.3960 },
"Bharatpur": { lat: 27.2173, lng: 77.4895 },
"Bhilwara": { lat: 25.3463, lng: 74.6350 },
"Bikaner": { lat: 28.0229, lng: 73.3119 },
"Bundi": { lat: 25.4305, lng: 75.6499 },
"Chittorgarh": { lat: 24.8887, lng: 74.6269 },
"Churu": { lat: 28.2920, lng: 74.9672 },
"Dausa": { lat: 26.8895, lng: 76.3353 },
"Dholpur": { lat: 26.7025, lng: 77.8938 },
"Dungarpur": { lat: 23.8433, lng: 73.7147 },
"Hanumangarh": { lat: 29.5814, lng: 74.3294 },
"Jaipur": { lat: 26.9124, lng: 75.7873 },
"Jaisalmer": { lat: 26.9157, lng: 70.9083 },
"Jalore": { lat: 25.3500, lng: 72.6151 },
"Jhalawar": { lat: 24.5968, lng: 76.1650 },
"Jhunjhunu": { lat: 28.1279, lng: 75.3959 },
"Jodhpur": { lat: 26.2389, lng: 73.0243 },
"Karauli": { lat: 26.4980, lng: 77.0150 },
"Kota": { lat: 25.2138, lng: 75.8648 },
"Nagaur": { lat: 27.2020, lng: 73.7409 },
"Pali": { lat: 25.7711, lng: 73.3234 },
"Pratapgarh": { lat: 24.0324, lng: 74.7810 },
"Rajsamand": { lat: 25.0712, lng: 73.8798 },
"Sawai Madhopur": { lat: 26.0234, lng: 76.3467 },
"Sikar": { lat: 27.6094, lng: 75.1399 },
"Sirohi": { lat: 24.8826, lng: 72.8586 },
"Sri Ganganagar": { lat: 29.9038, lng: 73.8772 },
"Tonk": { lat: 26.1666, lng: 75.7885 },
"Udaipur": { lat: 24.5854, lng: 73.7125 },


    "Dadra": { lat: 20.2736, lng: 73.0158 },
    "Nagar Haveli": { lat: 20.1809, lng: 73.0169 },
    "Daman": { lat: 20.3974, lng: 72.8328 },
    "Diu": { lat: 20.7130, lng: 70.9870 },
    "Central Delhi": { lat: 28.6304, lng: 77.2177 },
    "East Delhi": { lat: 28.6610, lng: 77.3026 },
    "New Delhi": { lat: 28.6139, lng: 77.2090 },
    "North Delhi": { lat: 28.7160, lng: 77.2080 }
    // Add other districts here with their respective lat and lng
};

function initMap() {
    // Initialize map centered on India
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: { lat: 20.5937, lng: 78.9629 }  // Centered on India
    });
}

function updateDistricts() {
    const state = document.getElementById("state").value;
    const districtSelect = document.getElementById("district");

    districtSelect.innerHTML = '<option value="">--Select District--</option>';

    if (state && stateDistricts[state]) {
        stateDistricts[state].forEach(district => {
            const option = document.createElement("option");
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }
    
}

function showMap() {
    const date = document.getElementById("date").value;
    const state = document.getElementById("state").value;
    const district = document.getElementById("district").value;

    if (!date || !state || !district ) {
        alert("Please select all fields.");
        return;
    }
//select lay lng for distrcit
    const location = districtLatLng[district];

     if (location) {
         // Map focus on district
        const latLng = location;
        map.setCenter(location);
        map.setZoom(10);
 
         const marker = new google.maps.Marker({
             position: latLng,
             map: map,
             title: `${district}`,
         });
 
         document.getElementById("info-content").innerText = `${district}, ${state}\nDate: ${date}`;
        } else {
            alert("No location data available for the selected district.");
        }
    }
