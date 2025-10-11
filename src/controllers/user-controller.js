const { response, mailer } = require("../utility");
const { user_service, verification_service } = require("../service");
require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const { generateTokenAndSetCookie } = require("../utility");
const bcrypt = require("bcryptjs/dist/bcrypt");
const { sendVerificationEmail } = require("../utility/mail-trap/emails");

async function get_user(req, res) {
  const id = req.params.id;

  try {
    // Validate MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Fetch user from DB using your service
    const data = await user_service.get_user(id);

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    const { goodResponse } = response;
    goodResponse.data = data;

    return res.status(200).json(goodResponse);
  } catch (error) {
    const { badResponse } = response;
    badResponse.message = error.message;
    console.error("Error fetching data from DB:", error);

    return res.status(500).json(badResponse);
  }
}

async function edit_user_detail(req, res) {
  const id = req.params.id;
  const { body, file, files } = req;
  console.log(file);
  const uploadBufferToCloudinary = (fileBuffer, folder = "user") => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          timeout: 600000, // 10 minutes
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(fileBuffer);
    });
  };

  let profileImageUrl = "";
  console.log(file, "that is it ");
  const result = await uploadBufferToCloudinary(file.buffer, "profileImage");
  profileImageUrl = result.secure_url;
  console.log(profileImageUrl, "hrhjrhrrhjrhrhrhrhrhrhhrhrhrhrhrh");

  try {
    let object = {
      email: body.email,
      phoneNumber: body.phoneNumber,
    };

    object.profileImage = profileImageUrl;
    // Handle Cloudinary upload

    const data = await user_service.edit_user_details(id, object);

    const responseData = { ...response.goodResponse };
    responseData.message = "Successfully updated your profile";
    responseData.data = data;
    console.log(data);
    return res.json(responseData);
  } catch (err) {
    const responseData = { ...response.badResponse };
    responseData.message = `Something went wrong: ${err.message || err}`;
    return res.json(responseData);
  }
}

function logout_user(req, res) {
  const { goodResponse } = response;

  res.clearCookie("token");
  res.clearCookie("isAuth");
  goodResponse.message = " logut succesful ";
  return res.json(goodResponse);
}
async function login_user(req, res) {
  const { email, password } = req.body;
  const api_key = process.env.JWT_API_KEY;

  console.log("Process started:", email, password);

  try {
    const data = await verification_service.login_user(
      password,
      email,
      api_key
    );

    if (!data) {
      const resp = {
        ...response.badResponse,
        message: "User not found or not verified",
      };
      return res.status(resp.status).json(resp);
    }

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(res, data._id);

    const resp = {
      ...response.goodResponse,
      message: "User successfully logged in",
      data,
    };
    return res.status(resp.status).json(resp);
  } catch (err) {
    const resp = { ...response.badResponse, message: err.message, error: err };
    return res.status(resp.status || 500).json(resp);
  }
}

async function forgot_password(req, res) {
  const { email } = req.body;
  const { goodResponse, badResponse } = response;
  try {
    const data = await user_service.forgot_password(email);
    return res.json((goodResponse.data = data));
  } catch (error) {
    console.error("Error fetching data from DB:", error);
    badResponse.message = error.message;
    return res.status(500).json(badResponse);
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
  /////CHECK IF USER EXIST
  const alreadyExist = await user_service.find_user({
    email: email,
    verifiedEmail: true,
  });

  if (alreadyExist) {
    response.badResponse.message = "this email have been used  ";

    response.badResponse.status = 501;
    return res.status(response.badResponse.status).json(response.badResponse);
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

    // generateTokenAndSetCookie(res, data._id.toString());

    const { goodResponse } = response;

    return res.status(goodResponse.status).json((goodResponse.data = data));
  }
  const { goodResponse } = response;
  return res
    .status(goodResponse.status)
    .json((response.badResponse.message = "all input is required"));
}
// async function verify_user(req, res) {
//   const { verificationCode } = req.body;
//   console.log(verificationCode)
//   const data = await user_service.verify(verificationCode);
//   const responseData = response.goodResponse;
//   responseData.data = data;
//   return res.json(responseData);
// }

async function delete_user(req, res) {
  try {
    const id = await req.user.id;
    const data = await user_service.delete(id);
    const responseData = response.goodResponse;
    responseData.data = "data";
    return res.json(responseData);
  } catch (error) {
    const responseData = response.badResponse;
    responseData.message = error.message;
    return res.json(responseData);
  }
}
async function find_users(req, res) {
  const { minAge, maxAge, rule, email, limit, bardge, id, adminVerified } =
    req.query;
  console.log(req.query);

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
    const responseData = response.goodResponse;
    responseData.data = data;
    return res.json(responseData).status(200);
  } catch (error) {
    const responseData = response.badResponse;
    console.error("Error fetching data from DB:", error);
    return res.status(500).json((responseData.message = error.message));
  }
}
async function pioneer(req, res) {
  console.log("hhhhhhhhhhhhhhhhhhhhhhhhh");
  try {
    const data = await user_service.filter({
      pioneer: true,
    });
    const responseData = response.goodResponse;
    responseData.data = data;
    console.log(data);
    return res.json(responseData).status(200);
  } catch (error) {
    const responseData = response.badResponse;
    console.error("Error fetching data from DB:", error);
    return res.status(500).json((responseData.message = error.message));
  }
}
async function reset_password(req, res) {
  const { badResponse, goodResponse } = response;
  const { token } = req.params;
  const { password } = req.body;
  try {
    const data = await user_service.reset_password({
      token: token,
      password: password,
    });
    if (!data) {
      const resp = badResponse;
      return res.json((resp.message = "no such user found "));
    }
    goodResponse.data = data;
    goodResponse.message = "password succesfully change ";
    return res.json(goodResponse);
  } catch (error) {
    console.log(error);
    return res.json((badResponse.message = error.message));
  }
}

module.exports = {
  signup_user,
  login_user,
  edit_user_detail,
  delete_user,
  get_user,
  find_users,
  logout_user,
  forgot_password,
  reset_password,
  reset_password,
  pioneer,
};
