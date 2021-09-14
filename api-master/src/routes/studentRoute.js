import { Router } from 'express';
import { addStudent,
         deleteStudent,
         updateStudent,
         getStudentsInfo,
         getStudentProfile,
         addStudentToGroup,
         removeStudentfromGroup,
         addStudentImported} from '../controllers/studentController.js';
import { loginRequired } from '../controllers/userController.js';
import multer from 'multer';

var upload = multer({ dest: 'uploads/' });
const router = Router();

// Add student
router.post('/add', loginRequired, addStudent);

// Delete student
router.delete('/delete', loginRequired, deleteStudent);

// Update student information
router.put('/update/:uniqueStudentID', loginRequired, updateStudent);

// Get all the students
router.post('/getall', loginRequired, getStudentsInfo);

// Get profile information from student
router.post('/profile/:uniqueStudentID', loginRequired, getStudentProfile);

// Add a single or multiple students to a group
router.put('/addtogroup', loginRequired, addStudentToGroup);

// Delete a single or multiple students from a group
router.delete('/removefromgroup', loginRequired, removeStudentfromGroup);

// Add a single or multiple students from a CSV file
router.post('/importstudent', upload.single("file"), loginRequired, addStudentImported);

export default router;