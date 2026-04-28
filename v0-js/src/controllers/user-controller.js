const { response, mailer } = require("../utility");
const { user_service, verification_service } = require("../service");
require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { generateTokenAndSetCookie } = require("../utility");
const bcrypt = require("bcryptjs/dist/bcrypt");
const { sendVerificationEmail } = require("../utility/mail-trap/emails");
const { goodResponse, badResponse } = response;

async function get_user(req, res) {
  const id = req.params.id;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(badResponse("Invalid ID format", 400));
    }

    const data = await user_service.get_user(id);

    if (!data) {
      return res.status(404).json(badResponse("User not found", 404));
    }

    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function edit_user_detail(req, res) {
  const id = req.params.id;
  const { body, file } = req;

  const uploadBufferToCloudinary = (fileBuffer, folder = "user") => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto", timeout: 600000 },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(fileBuffer);
    });
  };

  try {
    let object = {};
    if (body.email) object.email = body.email;
    if (body.phoneNumber) object.phoneNumber = body.phoneNumber;
    if (body.userName) object.userName = body.userName;
    if (body.address) object.address = body.address;
    if (body.bio) object.bio = body.bio;

    if (file && file.buffer) {
      const result = await uploadBufferToCloudinary(file.buffer, "profileImage");
      object.profileImage = result.secure_url;
    }

    const data = await user_service.edit_user_details(id, object);
    return res.json(goodResponse(data, "Successfully updated your profile"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function upload_profile_picture(req, res) {
  const id = req.params.id;
  const { file } = req;

  const uploadBufferToCloudinary = (fileBuffer, folder = "user") => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto", timeout: 600000 },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(fileBuffer);
    });
  };

  try {
    if (!file || !file.buffer) {
      return res.status(400).json(badResponse("No image file provided", 400));
    }

    const result = await uploadBufferToCloudinary(file.buffer, "profileImage");
    const profileImageUrl = result.secure_url;
    const data = await user_service.edit_user_details(id, { profileImage: profileImageUrl });
    return res.json(goodResponse(data, "Profile image updated successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

function logout_user(req, res) {
  res.clearCookie("token");
  res.clearCookie("isAuth");
  return res.json(goodResponse(null, "Logout successful"));
}
async function login_user(req, res) {
  const { email, password } = req.body;

  try {
    const data = await verification_service.login_user(password, email);

    if (!data) {
      return res.status(401).json(badResponse("Invalid email or password", 401));
    }

    generateTokenAndSetCookie(res, data._id);
    return res.json(goodResponse(data, "User successfully logged in"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function forgot_password(req, res) {
  const { email } = req.body;
  try {
    const result = await user_service.forgot_password(email);

    if (!result.success && result.message === "User not found") {
      return res.status(404).json(badResponse("No account found with this email address", 404));
    }

    return res.json(goodResponse({ email }, result.message));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function signup_user(req, res) {
  const {
    email,
    password,
    role = "geust",
    phoneNumber,
    dateOfBirth,
    userName,
  } = req.body;

  const alreadyExist = await user_service.find_user({
    email: email,
    verifiedEmail: true,
  });

  if (alreadyExist) {
    return res.status(501).json(badResponse("This email has already been used", 501));
  }
  if (email && password && role && phoneNumber && dateOfBirth) {
    const data = await verification_service.signup_user({
      email,
      password,
      email,
      password,
      role,
      phoneNumber,
      dateOfBirth,
      userName,
    });
    return res.json(goodResponse(data));
  }
  return res.status(400).json(badResponse("All input is required", 400));
}

async function delete_user(req, res) {
  try {
    const id = req.user.id;
    const data = await user_service.delete(id);
    return res.json(goodResponse(data, "User deleted successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function find_users(req, res) {
  const { minAge, maxAge, rule, email, limit, bardge, id, adminVerified } = req.query;

  try {
    const data = await user_service.find_users({
      minAge: parseInt(minAge),
      maxAge: parseInt(maxAge),
      rule: rule,
      email: decodeURIComponent(email),
      limit: parseInt(limit),
      bardge: parseInt(bardge),
      id: id,
      adminVerified: adminVerified,
    });
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function pioneer(req, res) {
  try {
    const data = await user_service.filter({ pioneer: true });
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function reset_password(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json(badResponse("Password must be at least 6 characters", 400));
  }

  try {
    const result = await user_service.reset_password({
      token: token,
      password: password,
    });

    if (!result.success) {
      return res.status(400).json(badResponse(result.message, 400));
    }

    return res.json(goodResponse({ email: result.user.email }, result.message));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

module.exports = {
  signup_user,
  login_user,
  edit_user_detail,
  upload_profile_picture,
  delete_user,
  get_user,
  find_users,
  logout_user,
  forgot_password,
  reset_password,
  pioneer,
};
