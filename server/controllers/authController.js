import User from "../models/User.js";
import ProviderProfile from "../models/ProviderProfile.js";
import generateToken from "../utils/helper.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const allowedRoles = ["customer", "provider"];
    const userRole = allowedRoles.includes(role) ? role : "customer";

    const user = await User.create({ name, email, password, role: userRole });

    if (userRole === "provider") {
      await ProviderProfile.create({ user: user._id });
    }

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = generateToken(user._id);
    const userObj = user.toJSON();
    res.json({ success: true, token, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === "provider") {
      profile = await ProviderProfile.findOne({ user: user._id }).populate(
        "categories",
      );
    }
    res.json({ success: true, user, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
