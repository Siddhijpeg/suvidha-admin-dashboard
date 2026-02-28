require("dotenv").config();
const mongoose   = require("mongoose");
const bcrypt     = require("bcryptjs");
const connectDB  = require("../config/db");
const User       = require("../models/User");
const Kiosk      = require("../models/Kiosk");
const Department = require("../models/Department");
const { Settings } = require("../models/Settings");

const seed = async () => {
  await connectDB();
  console.log("🌱 Seeding database...");

  // Clear existing
  await Promise.all([User.deleteMany(), Kiosk.deleteMany(), Department.deleteMany(), Settings.deleteMany()]);

  // ── Users ────────────────────────────────────────────────────
  await User.insertMany([
    { name:"Super Admin",  email:"superadmin@suvidha.gov.in", password: await bcrypt.hash("Admin@123",12), role:"super_admin" },
    { name:"Dept Admin",   email:"dept@suvidha.gov.in",       password: await bcrypt.hash("Admin@123",12), role:"department_admin" },
    { name:"Operator",     email:"operator@suvidha.gov.in",   password: await bcrypt.hash("Admin@123",12), role:"operator" },
  ]);
  console.log("✅ Users seeded");

  // ── Departments ───────────────────────────────────────────────
  await Department.insertMany([
    { name:"Electricity", icon:"⚡", color:"#f97316", description:"Electricity billing and utility services", serviceHours:"24/7", services:[
      { name:"View Current Bill", fee:0,   enabled:true  },
      { name:"Pay Bill",          fee:2.5, enabled:true  },
      { name:"Bill History",      fee:0,   enabled:true  },
      { name:"New Connection",    fee:50,  enabled:true  },
      { name:"Raise Complaint",   fee:0,   enabled:true  },
    ]},
    { name:"Water", icon:"💧", color:"#3b82f6", description:"Water supply and billing services", serviceHours:"9 AM – 6 PM", services:[
      { name:"View Bill",       fee:0,   enabled:true },
      { name:"Pay Bill",        fee:2.5, enabled:true },
      { name:"New Connection",  fee:75,  enabled:true },
      { name:"Raise Complaint", fee:0,   enabled:true },
    ]},
    { name:"Gas", icon:"🔥", color:"#ef4444", description:"Gas connection and billing services", serviceHours:"9 AM – 5 PM", services:[
      { name:"Pay Bill",        fee:2.5, enabled:true },
      { name:"New Connection",  fee:100, enabled:true },
      { name:"Raise Complaint", fee:0,   enabled:true },
    ]},
    { name:"Municipal", icon:"🏛️", color:"#6366f1", description:"Municipal corporation tax and civic services", serviceHours:"10 AM – 4 PM", services:[
      { name:"Property Tax",      fee:2.5, enabled:true },
      { name:"Trade License",     fee:5,   enabled:true },
      { name:"Birth Certificate", fee:20,  enabled:true },
      { name:"Raise Complaint",   fee:0,   enabled:true },
    ]},
    { name:"Transport", icon:"🚌", color:"#10b981", description:"Vehicle registration and permit services", enabled:false, serviceHours:"10 AM – 3 PM", services:[
      { name:"RC Status",       fee:0,  enabled:true },
      { name:"Driving License", fee:0,  enabled:true },
      { name:"Vehicle Permit",  fee:10, enabled:false },
    ]},
  ]);
  console.log("✅ Departments seeded");

  // ── Kiosks ─────────────────────────────────────────────────────
  await Kiosk.insertMany([
    { kioskId:"KSK-001", location:"Delhi Zone-A",   city:"New Delhi",  state:"Delhi",       ip:"192.168.1.101", status:"online",      uptime:99.2, printerStatus:"ok",    networkStatus:"ok",   softwareVersion:"v2.4.1", lastOnline:new Date(), totalSessions:1842, todaySessions:23 },
    { kioskId:"KSK-002", location:"Delhi Zone-B",   city:"New Delhi",  state:"Delhi",       ip:"192.168.1.102", status:"online",      uptime:98.7, printerStatus:"ok",    networkStatus:"ok",   softwareVersion:"v2.4.1", lastOnline:new Date(), totalSessions:1620, todaySessions:18 },
    { kioskId:"KSK-007", location:"Mumbai Central", city:"Mumbai",     state:"Maharashtra", ip:"192.168.2.107", status:"offline",     uptime:87.3, printerStatus:"error", networkStatus:"down", softwareVersion:"v2.3.8", lastOnline:new Date(Date.now()-720000), totalSessions:980, todaySessions:0 },
    { kioskId:"KSK-013", location:"Chennai South",  city:"Chennai",    state:"Tamil Nadu",  ip:"192.168.3.113", status:"maintenance", uptime:94.1, printerStatus:"ok",    networkStatus:"ok",   softwareVersion:"v2.4.0", lastOnline:new Date(Date.now()-3600000), totalSessions:1340, todaySessions:0 },
    { kioskId:"KSK-022", location:"Pune East",      city:"Pune",       state:"Maharashtra", ip:"192.168.4.122", status:"online",      uptime:99.8, printerStatus:"ok",    networkStatus:"ok",   softwareVersion:"v2.4.1", lastOnline:new Date(), totalSessions:2105, todaySessions:31 },
    { kioskId:"KSK-031", location:"Hyderabad West", city:"Hyderabad",  state:"Telangana",   ip:"192.168.5.131", status:"online",      uptime:97.4, printerStatus:"ok",    networkStatus:"ok",   softwareVersion:"v2.4.1", lastOnline:new Date(), totalSessions:1755, todaySessions:19 },
  ]);
  console.log("✅ Kiosks seeded");

  // ── Default settings ───────────────────────────────────────────
  await Settings.create({ sessionTimeout:5, defaultLanguage:"hi", audioGuidance:true, paymentMode:"test" });
  console.log("✅ Settings seeded");

  console.log("\n🎉 Database seeded successfully!");
  console.log("📧 Login with: superadmin@suvidha.gov.in / Admin@123");
  mongoose.disconnect();
};

seed().catch(err => { console.error(err); mongoose.disconnect(); });
