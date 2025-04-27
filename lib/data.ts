// City data
export interface City {
  id: string
  name: string
  state: string
  aqi: number
  sustainabilityScore: number
  greenSpace: number
  carbonEmissions: number
  population: number
  lat: number
  lng: number
}

export const cities: City[] = [
  {
    id: "1",
    name: "Delhi",
    state: "Delhi",
    aqi: 145,
    sustainabilityScore: 62,
    greenSpace: 20.2,
    carbonEmissions: 2.7,
    population: 16787941,
    lat: 28.7041,
    lng: 77.1025,
  },
  {
    id: "2",
    name: "Mumbai",
    state: "Maharashtra",
    aqi: 95,
    sustainabilityScore: 78,
    greenSpace: 14.8,
    carbonEmissions: 1.8,
    population: 12442373,
    lat: 19.076,
    lng: 72.8777,
  },
  {
    id: "3",
    name: "Bangalore",
    state: "Karnataka",
    aqi: 75,
    sustainabilityScore: 85,
    greenSpace: 27.5,
    carbonEmissions: 1.5,
    population: 8443675,
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: "4",
    name: "Chennai",
    state: "Tamil Nadu",
    aqi: 82,
    sustainabilityScore: 80,
    greenSpace: 19.8,
    carbonEmissions: 1.7,
    population: 4646732,
    lat: 13.0827,
    lng: 80.2707,
  },
  {
    id: "5",
    name: "Kolkata",
    state: "West Bengal",
    aqi: 110,
    sustainabilityScore: 70,
    greenSpace: 15.2,
    carbonEmissions: 2.1,
    population: 4496694,
    lat: 22.5726,
    lng: 88.3639,
  },
  {
    id: "6",
    name: "Pune",
    state: "Maharashtra",
    aqi: 78,
    sustainabilityScore: 82,
    greenSpace: 23.6,
    carbonEmissions: 1.6,
    population: 3124458,
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    id: "7",
    name: "Ahmedabad",
    state: "Gujarat",
    aqi: 98,
    sustainabilityScore: 75,
    greenSpace: 18.4,
    carbonEmissions: 2.0,
    population: 5570585,
    lat: 23.0225,
    lng: 72.5714,
  },
  {
    id: "8",
    name: "Hyderabad",
    state: "Telangana",
    aqi: 85,
    sustainabilityScore: 79,
    greenSpace: 21.7,
    carbonEmissions: 1.8,
    population: 6809970,
    lat: 17.385,
    lng: 78.4867,
  },
]

// State data
export interface State {
  id: string
  name: string
  population: number
  keyCities: string[]
  aqi: number
  greenSpace: number
}

export const states: State[] = [
  {
    id: "1",
    name: "Delhi",
    population: 16787941,
    keyCities: ["Delhi"],
    aqi: 145,
    greenSpace: 20.2,
  },
  {
    id: "2",
    name: "Maharashtra",
    population: 112374333,
    keyCities: ["Mumbai", "Pune", "Nagpur", "Thane"],
    aqi: 87,
    greenSpace: 16.5,
  },
  {
    id: "3",
    name: "Karnataka",
    population: 61095297,
    keyCities: ["Bangalore", "Mysore", "Hubli"],
    aqi: 75,
    greenSpace: 27.5,
  },
  {
    id: "4",
    name: "Tamil Nadu",
    population: 72147030,
    keyCities: ["Chennai", "Coimbatore", "Madurai"],
    aqi: 82,
    greenSpace: 19.8,
  },
  {
    id: "5",
    name: "West Bengal",
    population: 91276115,
    keyCities: ["Kolkata", "Asansol", "Siliguri"],
    aqi: 110,
    greenSpace: 15.2,
  },
  {
    id: "6",
    name: "Gujarat",
    population: 60439692,
    keyCities: ["Ahmedabad", "Surat", "Vadodara"],
    aqi: 98,
    greenSpace: 18.4,
  },
  {
    id: "7",
    name: "Telangana",
    population: 35193978,
    keyCities: ["Hyderabad", "Warangal", "Nizamabad"],
    aqi: 85,
    greenSpace: 21.7,
  },
]

// AQI trend data
export const aqiTrendData = [
  { month: "Jan", aqi: 120 },
  { month: "Feb", aqi: 135 },
  { month: "Mar", aqi: 115 },
  { month: "Apr", aqi: 95 },
  { month: "May", aqi: 85 },
  { month: "Jun", aqi: 110 },
]

// Recent reports data
export interface Report {
  id: string
  title: string
  description: string
  type: string
  location: string
  date: string
  status: string
  image?: string
  lat?: number
  lng?: number
}

export const recentReports: Report[] = [
  {
    id: "1",
    title: "Industrial Waste Dumping",
    description: "Factory dumping untreated waste into local river",
    type: "Pollution",
    location: "Yamuna River, Delhi",
    date: "2023-06-15",
    status: "Under Review",
    lat: 28.7041,
    lng: 77.1025,
  },
  {
    id: "2",
    title: "Improper Waste Segregation",
    description: "Residential complex not following waste segregation rules",
    type: "Waste",
    location: "Andheri, Mumbai",
    date: "2023-06-10",
    status: "Assigned",
    lat: 19.076,
    lng: 72.8777,
  },
  {
    id: "3",
    title: "Broken Water Pipeline",
    description: "Major water leakage from broken pipeline",
    type: "Infrastructure",
    location: "Koramangala, Bangalore",
    date: "2023-06-05",
    status: "Resolved",
    lat: 12.9716,
    lng: 77.5946,
  },
]

// Forum threads
export interface ForumThread {
  id: string
  title: string
  content: string
  author: string
  date: string
  upvotes: number
  downvotes: number
  comments: number
  tags: string[]
}

export const forumThreads: ForumThread[] = [
  {
    id: "1",
    title: "How effective is Delhi's odd-even vehicle policy?",
    content:
      "I'd like to discuss the effectiveness of Delhi's odd-even vehicle policy in reducing air pollution. Has anyone noticed any significant improvements?",
    author: "EcoActivist",
    date: "2023-06-15",
    upvotes: 45,
    downvotes: 5,
    comments: 23,
    tags: ["airquality", "transport", "delhi"],
  },
  {
    id: "2",
    title: "Community garden initiative in Mumbai",
    content:
      "We're starting a community garden in Bandra. Looking for volunteers and advice from those who have done similar projects.",
    author: "GreenThumb",
    date: "2023-06-12",
    upvotes: 38,
    downvotes: 0,
    comments: 15,
    tags: ["communitygarden", "mumbai", "urbanfarming"],
  },
  {
    id: "3",
    title: "Plastic ban implementation in Bangalore",
    content:
      "How is the plastic ban being enforced in Bangalore? Are businesses complying? What alternatives are being used?",
    author: "ZeroWaste",
    date: "2023-06-10",
    upvotes: 52,
    downvotes: 3,
    comments: 31,
    tags: ["plasticban", "bangalore", "wastemanagement"],
  },
  {
    id: "4",
    title: "Solar panel installation experiences",
    content:
      "Has anyone installed solar panels in Chennai? Looking for recommendations on suppliers and the permit process.",
    author: "SolarPower",
    date: "2023-06-08",
    upvotes: 29,
    downvotes: 2,
    comments: 18,
    tags: ["renewableenergy", "solar", "chennai"],
  },
  {
    id: "5",
    title: "Public transport improvements in Kolkata",
    content: "Kolkata's metro expansion is progressing. How will this impact traffic congestion and air quality?",
    author: "TransitFan",
    date: "2023-06-05",
    upvotes: 33,
    downvotes: 4,
    comments: 21,
    tags: ["publictransport", "kolkata", "airquality"],
  },
]

// Education topics
export interface EducationTopic {
  id: string
  title: string
  description: string
  tips: string[]
  image?: string
  videoUrl?: string
}

export const educationTopics: EducationTopic[] = [
  {
    id: "1",
    title: "Waste Reduction",
    description: "Learn how to reduce waste in your daily life and contribute to a cleaner environment.",
    tips: [
      "Use reusable bags for shopping",
      "Avoid single-use plastics",
      "Compost organic waste",
      "Buy products with minimal packaging",
      "Repair items instead of replacing them",
    ],
  },
  {
    id: "2",
    title: "Energy Conservation",
    description: "Simple ways to reduce energy consumption at home and in the workplace.",
    tips: [
      "Switch to LED bulbs",
      "Unplug electronics when not in use",
      "Use energy-efficient appliances",
      "Optimize heating and cooling systems",
      "Consider solar power for your home",
    ],
  },
  {
    id: "3",
    title: "Green Spaces",
    description: "The importance of urban green spaces and how to create and maintain them.",
    tips: [
      "Plant native trees and plants",
      "Create a balcony or terrace garden",
      "Participate in community garden initiatives",
      "Advocate for more parks in your area",
      "Maintain existing green spaces",
    ],
  },
  {
    id: "4",
    title: "Rainwater Harvesting",
    description: "Techniques for collecting and storing rainwater for various uses.",
    tips: [
      "Install a simple rain barrel",
      "Create a rooftop collection system",
      "Build a rain garden",
      "Use permeable surfaces in your yard",
      "Advocate for rainwater harvesting in your community",
    ],
  },
  {
    id: "5",
    title: "Pollution Control",
    description: "Understanding different types of pollution and how to reduce your contribution.",
    tips: [
      "Use public transportation or carpool",
      "Avoid burning waste",
      "Report industrial pollution",
      "Use eco-friendly cleaning products",
      "Reduce noise pollution",
    ],
  },
]

// Government initiatives
export interface Initiative {
  id: string
  title: string
  description: string
  status: "Active" | "Draft" | "Completed"
  reports: number
  date: string
}

export const initiatives: Initiative[] = [
  {
    id: "1",
    title: "Clean Air Program - Delhi",
    description: "Comprehensive plan to reduce air pollution in Delhi through various measures.",
    status: "Active",
    reports: 156,
    date: "2023-01-15",
  },
  {
    id: "2",
    title: "Plastic Ban Implementation - Maharashtra",
    description: "Strict enforcement of plastic ban with penalties for non-compliance.",
    status: "Active",
    reports: 89,
    date: "2023-02-10",
  },
  {
    id: "3",
    title: "Green Transport Initiative - Bangalore",
    description: "Promoting electric vehicles and improving public transportation.",
    status: "Draft",
    reports: 42,
    date: "2023-03-05",
  },
  {
    id: "4",
    title: "Water Conservation Project - Chennai",
    description: "Implementing water conservation measures and rainwater harvesting.",
    status: "Active",
    reports: 78,
    date: "2023-04-20",
  },
  {
    id: "5",
    title: "Waste Management System - Kolkata",
    description: "Improving waste collection, segregation, and processing infrastructure.",
    status: "Completed",
    reports: 112,
    date: "2023-05-12",
  },
]
