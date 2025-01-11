const { MongoClient, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
require("dotenv").config();

const uri = process.env.MONGO_URI;

let client;

async function connectToDB() {
  if (!client) {
    client = new MongoClient(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    await client.connect();
  }
  return client.db("MMAdmin");
}

async function findUser(username, password) {
  const db = await connectToDB();
  const users = db.collection("AdminLogin");
  const user = await users.findOne({ username, password });
  return user;
}

async function fetchMembers(location) {
  try {
    const db = await connectToDB();
    console.log("Fetching members from collection:", location);
    const members = db.collection(location);
    const data = await members.find().toArray();
    console.log(`Found ${data.length} members in ${location}`);
    return data;
  } catch (error) {
    console.error(`Error fetching members from ${location}:`, error);
    throw error;
  }
}

async function updateMemberStatusInDb(memberId, month, status, location) {
  const db = await connectToDB();
  const members = db.collection(location);
  const paymentYear = location.includes('Mahalla') ? 'mahalla_2024' : 
                     location.includes('Hifl') ? 'hifl_2024' : 'janaza_2024';
                     
  const updateQuery = { _id: new ObjectId(memberId) };
  const updateData = {
    $set: {
      [`${paymentYear}.${month}`]: status,
    },
  };
  await members.updateOne(updateQuery, updateData);
}

async function createAdmin(username, password) {
  try {
    const db = await connectToDB();
    const adminCollection = db.collection("AdminLogin");
    
    // Check if username already exists
    const existingUser = await adminCollection.findOne({ username });
    if (existingUser) {
      return { success: false, message: "Username already exists" };
    }
    
    // Hash password (you should add proper password hashing)
    // Create new admin
    const result = await adminCollection.insertOne({
      username,
      password, // In production, this should be hashed
      role: "admin",
      createdAt: new Date()
    });
    
    if (result.acknowledged) {
      return { success: true, message: "Admin created successfully" };
    } else {
      return { success: false, message: "Failed to create admin" };
    }
  } catch (error) {
    console.error("Error creating admin:", error);
    return { success: false, message: "Internal server error" };
  }
}

async function addMember(memberData) {
  try {
    if (!memberData || !memberData.location) {
      throw new Error("Invalid member data");
    }

    const db = await connectToDB();
    const memberCollection = db.collection(memberData.location);
    
    const paymentYear = memberData.location.includes('Mahalla') ? 'mahalla_2024' : 
                       memberData.location.includes('Hifl') ? 'hifl_2024' : 'janaza_2024';
    
    const result = await memberCollection.insertOne({
      name: memberData.name,
      telephone: memberData.telephone,
      address: memberData.address,
      [paymentYear]: {} // Initialize empty payment status for 2024
    });
    
    if (result.acknowledged) {
      return { success: true, message: "Member added successfully" };
    } else {
      return { success: false, message: "Failed to add member" };
    }
  } catch (error) {
    console.error("Error in addMember function:", error);
    return { success: false, message: error.message || "Internal server error" };
  }
}

async function updateMember(memberData) {
  try {
    if (!memberData || !memberData._id || !memberData.location) {
      console.error("Missing required data:", { memberData });
      throw new Error("Invalid member data");
    }

    const db = await connectToDB();
    const memberCollection = db.collection(memberData.location);
    
    console.log("Raw member ID received:", memberData._id);
    
    let _id;
    try {
      // Clean and validate the ID string
      const idString = memberData._id.toString().trim();
      if (!idString.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID format");
      }
      _id = new ObjectId(idString);
      console.log("Converted ObjectId:", _id);
    } catch (error) {
      console.error("ObjectId conversion failed:", error);
      throw new Error("Invalid member ID format");
    }

    const updateResult = await memberCollection.updateOne(
      { _id },
      { 
        $set: {
          name: memberData.name,
          telephone: memberData.telephone,
          address: memberData.address,
          updatedAt: new Date()
        }
      }
    );
    
    console.log("Update result:", updateResult);
    
    if (updateResult.matchedCount === 0) {
      return { success: false, message: "Member not found" };
    }
    
    if (updateResult.modifiedCount === 1) {
      return { success: true, message: "Member updated successfully" };
    } else {
      return { success: false, message: "No changes were made" };
    }
  } catch (error) {
    console.error("Error in updateMember function:", error);
    return { 
      success: false, 
      message: error.message || "Internal server error" 
    };
  }
}

mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

const memberSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  telephone: {
    type: String,
  },
});

const Member = mongoose.model("Member", memberSchema);

module.exports = {
  connectToDB,
  findUser,
  User,
  Member,
  fetchMembers,
  updateMemberStatusInDb,
  createAdmin,
  addMember,
  updateMember,
};
