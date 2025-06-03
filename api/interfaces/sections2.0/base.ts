
/**
 * Supported US States and territories (from the dropdown options in the form)
 */
type USState = 
  | "AK" | "AL" | "AR" | "AS" | "AZ" | "CA" | "CO" | "CT" | "DC" | "DE" 
  | "FL" | "FM" | "GA" | "GU" | "HI" | "IA" | "ID" | "IL" | "IN" | "KS" 
  | "KY" | "LA" | "MA" | "MD" | "ME" | "MH" | "MI" | "MN" | "MO" | "MP" 
  | "MS" | "MT" | "NC" | "ND" | "NE" | "NH" | "NJ" | "NM" | "NV" | "NY" 
  | "OH" | "OK" | "OR" | "PA" | "PR" | "PW" | "RI" | "SC" | "SD" | "TN" 
  | "TX" | "UT" | "VA" | "VI" | "VT" | "WA" | "WI" | "WV" | "WY" | "AS" 
  | "FQ" | "GU" | "HQ" | "DQ" | "JQ" | "KQ" | "MH" | "FM" | "MQ" | "BQ" 
  | "MP" | "PW" | "LQ" | "PR" | "VI" | "WQ" | "AA" | "AE" | "AP" | "";

/**
 * Supported countries (extensive list from the form's country dropdown)
 */
type Country = 
  | "Afghanistan" | "Akrotiri Sovereign Base Area" | "Albania" | "Algeria" 
  | "Andorra" | "Angola" | "Anguilla" | "Antarctica" | "Antigua and Barbuda" 
  | "Argentina" | "Armenia" | "Aruba" | "Ashmore and Cartier Islands" 
  | "Australia" | "Austria" | "Azerbaijan" | "Bahamas, The" | "Bahrain" 
  | "Bangladesh" | "Barbados" | "Bassas da India" | "Belarus" | "Belgium" 
  | "Belize" | "Benin" | "Bermuda" | "Bhutan" | "Bolivia" 
  | "Bosnia and Herzegovina" | "Botswana" | "Bouvet Island" | "Brazil" 
  | "British Indian Ocean Territory" | "British Virgin Islands" | "Brunei" 
  | "Bulgaria" | "Burkina Faso" | "Burma" | "Burundi" | "Cambodia" 
  | "Cameroon" | "Canada" | "Cape Verde" | "Cayman Islands" 
  | "Central African Republic" | "Chad" | "Chile" | "China" 
  | "Christmas Island" | "Clipperton Island" | "Cocos Keeling Islands" 
  | "Colombia" | "Comoros" | "Congo" | "Congo, Democratic Republic of the" 
  | "Cook Islands" | "Coral Sea Islands" | "Costa Rica" | "Cote d'Ivoire" 
  | "Croatia" | "Cuba" | "Cyprus" | "Czech Republic" | "Denmark" 
  | "Dhekelia Sovereign Base Area" | "Djibouti" | "Dominica" 
  | "Dominican Republic" | "East Timor" | "Ecuador" | "Egypt" 
  | "El Salvador" | "Equatorial Guinea" | "Eritrea" | "Estonia" 
  | "Ethiopia" | "Etorofu, Habomai, Kunashiri And Shikotan Islands" 
  | "Europa Island" | "Falkland Islands Islas Malvinas" | "Faroe Islands" 
  | "Fiji" | "Finland" | "France" | "French Guiana" | "French Polynesia" 
  | "French Southern and Antarctic Lands" | "Gabon" | "Gambia, The" 
  | "Gaza Strip" | "Georgia" | "Germany" | "Ghana" | "Gibraltar" 
  | "Glorioso Islands" | "Greece" | "Greenland" | "Grenada" 
  | "Guadeloupe" | "Guatemala" | "Guernsey" | "Guinea" | "Guinea-Bissau" 
  | "Guyana" | "Haiti" | "Heard Island and McDonald Islands" | "Honduras" 
  | "Hong Kong" | "Hungary" | "Iceland" | "India" | "Indonesia" | "Iran" 
  | "Iraq" | "Ireland" | "Isle of Man" | "Israel" | "Italy" | "Jamaica" 
  | "Jan Mayen" | "Japan" | "Jersey" | "Jordan" | "Juan de Nova Island" 
  | "Kazakhstan" | "Kenya" | "Kiribati" | "Kosovo" | "Kuwait" 
  | "Kyrgyzstan" | "Laos" | "Latvia" | "Lebanon" | "Lesotho" | "Liberia" 
  | "Libya" | "Liechtenstein" | "Lithuania" | "Luxembourg" | "Macau" 
  | "Macedonia" | "Madagascar" | "Malawi" | "Malaysia" | "Maldives" 
  | "Mali" | "Malta" | "Marshall Islands" | "Martinique" | "Mauritania" 
  | "Mauritius" | "Mayotte" | "Mexico" | "Micronesia, Federated States of" 
  | "Moldova" | "Monaco" | "Mongolia" | "Montenegro" | "Montserrat" 
  | "Morocco" | "Mozambique" | "Namibia" | "Nauru" | "Nepal" 
  | "Netherlands" | "Netherlands Antilles" | "New Caledonia" 
  | "New Zealand" | "Nicaragua" | "Niger" | "Nigeria" | "Niue" 
  | "Norfolk Island" | "North Korea" | "Norway" | "Oman" | "Pakistan" 
  | "Palau" | "Panama" | "Papua New Guinea" | "Paracel Islands" 
  | "Paraguay" | "Peru" | "Philippines" | "Pitcairn Islands" | "Poland" 
  | "Portugal" | "Qatar" | "Reunion" | "Romania" | "Russia" | "Rwanda" 
  | "Saint Barthelemy" | "Saint Helena" | "Saint Kitts and Nevis" 
  | "Saint Lucia" | "Saint Martin" | "Saint Pierre and Miquelon" 
  | "Saint Vincent and the Grenadines" | "Samoa" | "San Marino" 
  | "Sao Tome and Principe" | "Saudi Arabia" | "Senegal" | "Serbia" 
  | "Seychelles" | "Sierra Leone" | "Singapore" | "Slovakia" | "Slovenia" 
  | "Solomon Islands" | "Somalia" | "South Africa" 
  | "South Georgia and the South Sandwich Islands" | "South Korea" 
  | "Spain" | "Spratly Islands" | "Sri Lanka" | "Sudan" | "Suriname" 
  | "Svalbard" | "Swaziland" | "Sweden" | "Switzerland" | "Syria" 
  | "Taiwan" | "Tajikistan" | "Tanzania" | "Thailand" | "Togo" 
  | "Tokelau" | "Tonga" | "Trinidad and Tobago" | "Tromelin Island" 
  | "Tunisia" | "Turkey" | "Turkmenistan" | "Turks and Caicos Islands" 
  | "Tuvalu" | "Uganda" | "Ukraine" | "United Arab Emirates" 
  | "United Kingdom" | "Uruguay" | "Uzbekistan" | "Vanuatu" 
  | "Vatican City" | "Venezuela" | "Vietnam" | "Wallis and Futuna" 
  | "West Bank" | "Western Sahara" | "Yemen" | "Zambia" | "Zimbabwe" | "";



  export type {
    USState,
    Country
  };