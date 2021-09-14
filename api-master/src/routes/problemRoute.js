import { Router } from 'express';
import { updateProblem,
         getProblemsInfo,
         removeTagfromProblem,
         addTagToProblem,
         getJudges,
         syncProblems} from '../controllers/problemController.js';
import { loginRequired } from '../controllers/userController.js';

const router = Router();

// Update problem information
router.put('/update/:uniqueProblemID', loginRequired, updateProblem);

// Get all the problems
router.post('/getall', loginRequired, getProblemsInfo);

// Add a single or multiple tags to problems
router.put('/addtag', loginRequired, addTagToProblem);

// Delete a single or multiple tags from problems
router.delete('/removetag', loginRequired, removeTagfromProblem);

// Get all the judges
router.get('/judges', loginRequired, getJudges);

// Sync the problems solved by students from judges
router.get('/sync', loginRequired, syncProblems);

export default router;
