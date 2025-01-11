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
    const memberCollection = db.collection(location);
    const members = await memberCollection.find({}).toArray();
    console.log(`Found ${members.length} members in ${location}`);

    // Convert ObjectId to string
    return members.map((member) => ({
      ...member,
      _id: member._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
}

async function updateMemberStatusInDb(memberId, month, status, location) {
  console.log(
    "Received memberID",
    memberId,
    "status",
    status,
    "location",
    location
  );

  if (!memberId) {
    throw new Error("Invalid memberid: memberId is undefined or null");
  }

  try {
    const db = await connectToDB();
    const memberCollection = db.collection(location);

    let objectId;
    try {
      objectId = new ObjectId(memberId);
    } catch (error) {
      throw new Error(`Invalid memberid format: ${memberId}`);
    }

    const member = await memberCollection.findOne({ _id: objectId });
    if (!member) throw new Error(`Member not found for ID: ${memberId}`);

    const paymentYear = location.includes("Mahalla")
      ? "mahalla_2024"
      : location.includes("Hifl")
      ? "hifl_2024"
      : "janaza_2024";

    const updateField = `${paymentYear}.${month.toLowerCase()}`;
    const result = await memberCollection.updateOne(
      { _id: objectId },
      { $set: { [updateField]: status } }
    );

    if (result.modifiedCount === 0) {
      throw new Error(`Failed to update member status for ID: ${memberId}`);
    }

    // Fetch the updated member document
    const updatedMember = await memberCollection.findOne({ _id: objectId });
    return updatedMember;
  } catch (error) {
    console.error("Error updating member status:", error);
    throw error;
  }
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
      createdAt: new Date(),
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

    const paymentYear = memberData.location.includes("Mahalla")
      ? "mahalla_2024"
      : memberData.location.includes("Hifl")
      ? "hifl_2024"
      : "janaza_2024";

    const result = await memberCollection.insertOne({
      name: memberData.name,
      telephone: memberData.telephone,
      address: memberData.address,
      [paymentYear]: {}, // Initialize empty payment status for 2024
    });

    if (result.acknowledged) {
      return { success: true, message: "Member added successfully" };
    } else {
      return { success: false, message: "Failed to add member" };
    }
  } catch (error) {
    console.error("Error in addMember function:", error);
    return {
      success: false,
      message: error.message || "Internal server error",
    };
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
          updatedAt: new Date(),
        },
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
      message: error.message || "Internal server error",
    };
  }
}

async function deleteMember(id) {
  try {
    if (!id) {
      throw new Error("Invalid member ID");
    }

    const db = await connectToDB();
    const collections = await db.listCollections().toArray();
    let deletedMember = null;

    for (const collectionInfo of collections) {
      const collection = db.collection(collectionInfo.name);
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 1) {
        deletedMember = {
          success: true,
          message: "Member deleted successfully",
        };
        break;
      }
    }

    return deletedMember || { success: false, message: "Member not found" };
  } catch (error) {
    console.error("Error in deleteMember function:", error);
    return {
      success: false,
      message: error.message || "Internal server error",
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

const Member = mongoose.model("Member", memberSchema, "members");

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
  deleteMember,
};
