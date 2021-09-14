import { Router } from 'express';
import { addGroup,
         deleteGroup,
         updateGroup,
         getGroupsInfo,
         getGroupsForFilter,
         exportGroup } from '../controllers/groupController.js';
import { loginRequired } from '../controllers/userController.js';

const router = Router();

// Add group
router.post('/add', loginRequired, addGroup);

// Delete group
router.delete('/delete/:uniqueGroupID', loginRequired, deleteGroup);

// Update group information
router.put('/update/:uniqueGroupID', loginRequired, updateGroup);

// Get all groups info
router.post('/getall', loginRequired, getGroupsInfo);

// Get all groups for filters
router.get('/filter', loginRequired, getGroupsForFilter);

// Export group
router.get('/export/:uniqueGroupID', loginRequired, exportGroup);

export default router;