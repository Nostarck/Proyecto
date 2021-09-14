import { Router } from 'express';
import { addTag,
         deleteTag,
         updateTag,
         getTagsInfo,
         getTagsNames } from '../controllers/tagController.js';
import { loginRequired } from '../controllers/userController.js';

const router = Router();

// Add tag
router.post('/add', loginRequired, addTag);

// Delete tag
router.delete('/delete', loginRequired, deleteTag);

// Update student information
router.put('/update/:uniqueTagID', loginRequired, updateTag);

// Get all the tags
router.get('/getall', loginRequired, getTagsInfo);

// Get tag names for filters
router.get('/getnames', loginRequired,getTagsNames);

export default router;