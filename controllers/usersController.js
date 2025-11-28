import { db } from "../db.js";
import bcrypt from "bcrypt";

const getAllUsers = async (req, res) => {
  try {
    const users = await db.query("SELECT * FROM users");
    // console.log(users.rows);

    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db.query("SELECT * FROM users WHERE id =$1", [id]);
    //console.log(user.rows.length);

    return res.json({ user: user.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  console.log(req.body);
  const { id, name, email, password } = req.body;

  try {
    const hashedPassowrd = await bcrypt.hash(password, 10);
    const updatedUser = await db.query(
      "UPDATE users SET name = $1, email= $2,  password= $3 WHERE id = $4 RETURNING *",
      [name, email, hashedPassowrd, id]
    );
    res
      .status(200)
      .json({ success: `User ${updatedUser.rows[0].email} updated` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid user ID",
      ok: false,
    });
  }

  try {
    const userExists = await db.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);

    if (userExists.rowCount === 0) {
      return res.status(404).json({
        message: "User not found",
        ok: false,
      });
    }

    // USUWAMY TYLKO USERA
    const result = await db.query("DELETE FROM users WHERE id = $1", [id]);

    return res.status(200).json({
      message: `User with id ${id} successfully deleted`,
      ok: true,
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({
      message: "Failed to delete user",
      ok: false,
    });
  }
};

export { getAllUsers, getUser, updateUser, deleteUser };
