import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import { sendContactEmail } from "../utils/mailer.js";

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ success: false, message: "User doesn't exist" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user.id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.json({ success: false, message: "User already exists" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password must be at least 8 characters" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
    const token = createToken(user.id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, name, email } = req.body;
    if (!name || !email) return res.json({ success: false, message: "Name and email are required" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email" });

    // Check email not taken by another user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      return res.json({ success: false, message: "Email already in use" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.json({ success: false, message: "All fields are required" });
    if (newPassword.length < 8) return res.json({ success: false, message: "New password must be at least 8 characters" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.json({ success: false, message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const contactUs = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.json({ success: false, message: "All fields are required" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email" });
    await sendContactEmail(name, email, message);
    res.json({ success: true, message: "Message sent! We'll get back to you soon." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to send message. Please try again." });
  }
};

export { loginUser, registerUser, adminLogin, getProfile, updateProfile, changePassword, listUsers, contactUs };