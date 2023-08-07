import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
    userId: String,
    avatar_url: String,
    name: String,
    id: Number,
    description: String,
    html_url: String,
    login: String,
    date: String,
    id: { type: String, unique: true }
});

// Create a model using the schema
const Repo = mongoose.model('user_repo', repoSchema);

export default Repo;
