import express from "express"
import { createRepo, createUser, groupBookmarksByDate, listRepos, loginUser, removeBookmarkedRepo, uploadRepo } from "../controllers/user.controller.js"
import { userValidation, repoValidation, reposValidattion } from "../middlewares/user.validation.js"
import readFileData from "../middlewares/multer.file.js"

const router = express.Router()

router.post('/signup', userValidation, createUser)
router.post('/login', loginUser)
router.post('/bookmark-repo', repoValidation, createRepo)
router.get('/list-repos/:userId', listRepos);
router.get('/repos-stats/:userId', groupBookmarksByDate);
router.delete('/remove-repo/:id', removeBookmarkedRepo);
router.post('/upload-repo', readFileData, reposValidattion, uploadRepo)



export default router