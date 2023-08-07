import { json } from "express";
import User from "../models/user.modal.js";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import Repo from "../models/user.repos.modal.js";
import moment from "moment";
const createUser = async (req, res) => {
    try {
        let { confirmPassword, email, name, password } = req.body
        const userExists = await User.findOne({ email })
        if (userExists) return res.status(200).json({ staus: 400, error: true, message: "Email is alreday taken.", data: {} })
        else {
            const hashedPassword = await bcrypt.hash(password, 10);

            let newUser = {
                email,
                password: hashedPassword,
                name
            }
            let user = await User.create(newUser)
            return res.status(200).json({ staus: 201, error: false, message: "Created sucesfully.", data: user })
        }

    } catch (error) {
        console.log(error)
        return res.status(200).json({ staus: 500, error: true, message: "Unable to process the requset at the moment.", data: {} })
    }
}



const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ status: 400, error: true, message: 'User not found' });
        }
        // Compare passwords
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(200).json({ status: 401, error: true, message: 'Invalid credentials' });
        }
        // Create a token with user information
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET || "JWT_SECRET",
        );
        res.status(200).json({ status: 200, error: false, data: { token, userId: user._id, email: user.email, name: user.name } });
    } catch (error) {
        console.error(error);
        res.status(200).json({ staus: 500, error: true, message: 'An error occurred' });
    }
}
// book mark an repo
const createRepo = async (req, res) => {
    try {
        const newRepo = req.body
        let date = moment().format("YYYY/MM/DD")
        newRepo.date = date
        let repo = await Repo.create(newRepo)
        return res.status(200).json({ staus: 201, error: false, message: "Created sucesfully.", data: repo })
    } catch (error) {
        console.error(error);
        res.status(200).json({ staus: 500, error: true, message: 'An error occurred' });
    }
}
// list all the repos
const listRepos = async (req, res) => {
    try {
        let { userId } = req.params
        let Repos = await Repo.find({ userId })
        return res.status(200).json({ staus: 201, error: false, message: "Repos.", data: Repos })
    } catch (error) {
        console.error(error);
        res.status(200).json({ staus: 500, error: true, message: 'An error occurred' });
    }
}

//  fetch the dates and bookmared repos count
const groupBookmarksByDate = async (req, res) => {
    try {
        const userId = req.params.userId; // Extract the userId from the route parameter
        const aggregationResult = await Repo.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            }
        ]);
        return res.status(200).json({ staus: 201, error: false, message: "Repos statistics.", data: aggregationResult })
    } catch (error) {
        console.error(error);
        res.status(200).json({ staus: 500, error: true, message: 'An error occurred' });
    }
};

// remove from bookmarked list

const removeBookmarkedRepo = async (req, res) => {
    try {
        let id = req.params.id
        let removedRepo = await Repo.findOneAndDelete({ id: id })
        if (removedRepo) return res.status(200).json({ staus: 201, error: false, message: "Removed" })
        else res.status(200).json({ staus: 500, error: true, message: 'Unbale to remove' });
    } catch (error) {
        console.error(error);
        res.status(200).json({ staus: 500, error: true, message: 'An error occurred' });
    }
}

//upload repo from csv
const uploadRepo = async (req, res) => {
    try {
        let { userId } = req.body
        let newRepos = req.data
        newRepos = await Promise.all(newRepos.map(repo => {
            repo.userId = userId
            repo.date = moment().format("YYYY/MM/DD")
            return repo
        }))
        let repo = await Repo.create(newRepos)
        return res.status(200).json({ staus: 201, error: false, message: "Created sucesfully.", data: repo })
    } catch (error) {
        console.error(error);
        if(error.code==11000)  return  res.status(200).json({ staus: 500, error: true, message: 'Id should be unique.' });
        return  res.status(200).json({ staus: 500, error: true, message: 'An error occurred' });
    }
}



export { createUser, loginUser, createRepo, listRepos, groupBookmarksByDate, removeBookmarkedRepo ,uploadRepo}